<?php

namespace App\Http\Controllers;

use App\Models\PaymentCheckout;
use App\Models\Purchase;
use App\Models\Refund;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends ApiController
{
    public function summary()
    {
        $paid = Purchase::withTrashed()->where('status', 'paid');
        $recent = (clone $paid)->latest('paid_at')->limit(6)->get()->map(function ($p) {
            $u = User::find($p->user_id);

            return ['id' => $p->id, 'titulo' => $p->content['titulo'] ?? 'Nós dois', 'cliente_nome' => $u?->name, 'cliente_email' => $u?->email, 'valor_cents' => $p->amount_paid_cents, 'moeda' => 'BRL', 'paid_at' => $p->paid_at?->getTimestampMs(), 'metodo' => $p->payment_method];
        });

        return $this->ok(['kpis' => ['receita_cents' => (clone $paid)->sum('amount_paid_cents'), 'compras' => (clone $paid)->count(), 'tickets_abertos' => Ticket::where('status', 'open')->count(), 'reembolsos_pendentes' => Refund::where('status', 'pending')->count(), 'clientes_total' => User::where('role', 'user')->count()], 'recentes' => $recent]);
    }

    private function client(User $u): array
    {
        return ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'created_at' => $u->created_at?->getTimestampMs(), 'purchases_count' => Purchase::withTrashed()->where('user_id', $u->id)->count(), 'total_spent_cents' => Purchase::withTrashed()->where('user_id', $u->id)->where('status', 'paid')->sum('amount_paid_cents'), 'tickets_count' => Ticket::where('user_id', $u->id)->count(), 'refunds_count' => Refund::where('user_id', $u->id)->count()];
    }

    public function clients()
    {
        return $this->ok(['clients' => User::where('role', 'user')->get()->map(fn ($u) => $this->client($u))]);
    }

    public function detail(User $user, PurchaseController $gifts)
    {
        abort_unless($user->role === 'user', 404);

        return $this->ok(['client' => $this->client($user), 'purchases' => Purchase::withTrashed()->where('user_id', $user->id)->get()->map(fn ($p) => $gifts->project($p)), 'tickets' => Ticket::where('user_id', $user->id)->get(), 'refunds' => Refund::where('user_id', $user->id)->get()]);
    }

    public function purchases(PurchaseController $gifts)
    {
        return $this->ok(['purchases' => Purchase::withTrashed()->latest()->get()->map(function ($p) use ($gifts) {
            return [...$gifts->project($p), 'cliente' => User::find($p->user_id)?->only(['id', 'name', 'email'])];
        })]);
    }

    public function confirmPix(Request $request, Purchase $purchase)
    {
        $data = $request->validate(['amount_cents' => 'required|integer|min:1', 'bank_reference' => ['required', 'string', 'regex:/\A[A-Za-z0-9-]{8,64}\z/'], 'received' => 'required|accepted']);
        $data['bank_reference'] = strtoupper($data['bank_reference']);
        try {
            DB::transaction(function () use ($request, $purchase, $data) {
                $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
                abort_if(User::findOrFail($p->user_id)->deletion_requested_at, 409, 'Conta desativada.');
                $checkout = PaymentCheckout::where('purchase_id', $p->id)->lockForUpdate()->firstOrFail();
                abort_unless($checkout->provider === 'pix_manual', 409, 'Este pedido não usa Pix manual.');
                abort_unless($checkout->amount_cents === (int) $data['amount_cents'], 422, 'O valor recebido precisa corresponder ao pedido.');
                if ($p->status === 'paid' && $checkout->bank_reference === $data['bank_reference']) {
                    return;
                }
                abort_unless($p->status === 'pending' && $checkout->status === 'awaiting_confirmation', 409, 'Pedido já processado.');
                $checkout->update(['bank_reference' => $data['bank_reference'], 'confirmed_by' => $request->user()->id, 'confirmed_at' => now(), 'status' => 'approved']);
                $p->update(['status' => 'paid', 'paid_at' => now(), 'payment_method' => 'pix', 'amount_paid_cents' => $checkout->amount_cents, 'coupon' => $checkout->coupon, 'discount_percent' => $checkout->discount_percent]);
            });
        } catch (UniqueConstraintViolationException) {
            abort(409, 'Esse identificador bancário já foi usado em outro pedido.');
        }

        return $this->ok(['confirmed' => true]);
    }

    public function refunds()
    {
        return $this->ok(['refunds' => Refund::latest()->get()->map(function ($r) {
            $p = Purchase::withTrashed()->find($r->purchase_id);

            return [...$r->toArray(), 'created_at' => $r->created_at->getTimestampMs(), 'cliente' => User::find($r->user_id)?->only(['id', 'name', 'email']), 'purchase' => $p ? ['id' => $p->id, 'titulo' => $p->content['titulo'] ?? 'Nós dois', 'valor_cents' => $p->amount_paid_cents] : null];
        })]);
    }

    public function decision(Request $request, Refund $refund)
    {
        $data = $request->validate(['status' => 'required|in:approved,rejected', 'note' => 'nullable|string|max:500', 'refund_sent' => 'sometimes|boolean']);
        DB::transaction(function () use ($refund, $data) {
            $r = Refund::whereKey($refund->id)->lockForUpdate()->firstOrFail();
            if ($r->status === $data['status']) {
                return;
            }abort_unless($r->status === 'pending', 409, 'Solicitação já processada.');
            $p = Purchase::withTrashed()->whereKey($r->purchase_id)->lockForUpdate()->firstOrFail();
            if ($data['status'] === 'approved') {
                $checkout = PaymentCheckout::where('purchase_id', $p->id)->lockForUpdate()->first();
                if ($checkout?->provider === 'mercadopago') {
                    abort_unless($checkout->status === 'refunded' && $p->status === 'refunded', 409, 'Efetue o estorno no painel Mercado Pago e aguarde a confirmação pelo webhook.');
                }
                if ($checkout?->provider === 'pix_manual') {
                    abort_unless($data['refund_sent'] ?? false, 422, 'Devolva o Pix no banco antes de confirmar o reembolso.');
                    $checkout->update(['status' => 'refunded']);
                }
                abort_unless($p->status === 'paid' || ($checkout?->provider === 'mercadopago' && $checkout->status === 'refunded' && $p->status === 'refunded'), 409, 'Compra não reembolsável.');
                $p->update(['status' => 'refunded']);
            }$r->update(['status' => $data['status'], 'review_note' => $data['note'] ?? null, 'reviewed_at' => now()]);
        });

        return $this->ok(['ok' => true]);
    }

    public function tickets()
    {
        return $this->ok(['tickets' => Ticket::latest()->get()->map(fn ($t) => [...$t->toArray(), 'created_at' => $t->created_at->getTimestampMs(), 'cliente' => User::find($t->user_id)?->only(['id', 'name', 'email'])])]);
    }

    public function reply(Request $request, Ticket $ticket)
    {
        $data = $request->validate(['text' => 'required|string|max:2000']);
        $t = DB::transaction(function () use ($ticket, $data) {
            $t = Ticket::whereKey($ticket->id)->lockForUpdate()->firstOrFail();
            $messages = $t->messages;
            $messages[] = ['role' => 'admin', 'text' => $data['text'], 'at' => now()->getTimestampMs()];
            $t->update(['messages' => $messages, 'status' => 'answered']);

            return $t;
        });

        return $this->ok(['ticket' => $t]);
    }
}
