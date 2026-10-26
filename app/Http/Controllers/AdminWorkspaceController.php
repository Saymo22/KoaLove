<?php

namespace App\Http\Controllers;

use App\Mail\AdminInvitationMail;
use App\Models\Coupon;
use App\Models\PaymentCheckout;
use App\Models\Plan;
use App\Models\Promotion;
use App\Models\Purchase;
use App\Models\Refund;
use App\Models\Ticket;
use App\Models\User;
use App\Services\AdminConfiguration;
use App\Services\Pricing;
use App\Support\PlanLimits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class AdminWorkspaceController extends ApiController
{
    public function workspace(Request $request, AdminConfiguration $config, AdminController $admin)
    {
        $level = $request->user()->admin_level ?? 'owner';
        $support = $level === 'support';
        $users = User::all()->keyBy('id');
        $purchases = $support ? collect() : Purchase::withTrashed()->get();
        $checkouts = $support ? collect() : PaymentCheckout::all()->keyBy('purchase_id');
        $refunds = Refund::latest()->get();
        $tickets = Ticket::latest()->get();
        $clients = User::where('role', 'user')->whereNull('deletion_requested_at')->get()->map(fn ($u) => [
            'id' => (string) $u->id, 'nome' => $u->name, 'email' => $u->email, 'desde' => $u->created_at->toDateString(),
            'compras' => $purchases->where('user_id', $u->id)->whereNotNull('paid_at')->count(),
            'gasto' => $purchases->where('user_id', $u->id)->where('status', 'paid')->sum('amount_paid_cents') / 100,
            'tickets' => $tickets->where('user_id', $u->id)->count(), 'reembolsos' => $refunds->where('user_id', $u->id)->count(), 'nota' => $u->admin_note ?? '',
        ]);
        $receipts = $support ? collect() : DB::table('payment_receipts')->where('refunded_cents', '>', 0)->get()->keyBy('id');
        $ledger = [];
        foreach ($purchases->whereNotNull('paid_at') as $p) {
            $who = $users[$p->user_id]?->name ?? 'Conta removida';
            $ledger[] = ['id' => $p->id, 'ts' => $p->paid_at->toIso8601String(), 'kind' => 'in', 'value' => $p->amount_paid_cents / 100, 'planId' => $p->plan_id, 'title' => $p->content['titulo'] ?? 'Presente', 'who' => $who];
            $checkout = $checkouts->get($p->id);
            $receipt = $checkout ? $receipts->get($checkout->paid_payment_id) : null;
            if ($p->status === 'refunded' || $receipt) {
                $review = $refunds->where('purchase_id', $p->id)->where('status', 'approved')->first();
                $date = $receipt?->updated_at ?? $review?->reviewed_at ?? ($checkout?->status === 'refunded' ? $checkout->updated_at : null);
                $ledger[] = ['id' => 'R-'.$p->id, 'ts' => $date ? (string) $date : null, 'kind' => 'out', 'value' => ($receipt?->refunded_cents ?? $p->amount_paid_cents) / 100, 'planId' => $p->plan_id, 'title' => 'Reembolso · '.($p->content['titulo'] ?? 'Presente'), 'who' => $who];
            }
        }
        $pix = $checkouts->where('provider', 'pix_manual')->map(function ($c) use ($purchases, $users) {
            $p = $purchases->firstWhere('id', $c->purchase_id);

            return ['id' => $c->purchase_id, 'cliente' => $p ? ($users[$p->user_id]?->name ?? 'Conta removida') : 'Conta removida', 'valor' => $c->amount_cents / 100, 'planoId' => $p?->plan_id,
                'comp' => 'Dados do pedido', 'status' => match ($c->status) {
                    'approved' => 'conferido', 'rejected' => 'recusado', 'awaiting_confirmation' => $p?->trashed() ? 'recusado' : 'pendente', default => 'recusado'
                }, 'ts' => $c->created_at->toIso8601String(),
                'reference' => $c->bank_reference, 'txid' => $c->pix_details['txid'] ?? '', 'deleted' => $p?->trashed() ?? true];
        })->values();
        $mapOffer = fn ($o) => ['id' => $o->id, 'nome' => $o->name, 'codigo' => $o->code, 'planoId' => $o->plan_id ?? 'all', 'tipo' => $o->discount_cents !== null ? 'fixed' : 'percent', 'valor' => $o->discount_cents !== null ? $o->discount_cents / 100 : $o->discount_percent, 'inicio' => $o->starts_at?->toIso8601String(), 'fim' => $o->ends_at?->toIso8601String(), 'ativo' => $o->active, 'limite' => $o->usage_limit ?? 0,
            'usos' => $o instanceof Coupon ? app(Pricing::class)->couponUses($o->code) : 0];
        $settings = array_replace($config->all(), $request->user()->admin_preferences ?? []);
        if ($level !== 'owner') {
            unset($settings['pixKey']);
        }

        return $this->ok([
            'clients' => $clients, 'ledger' => $ledger, 'pix' => $pix,
            'orders' => $purchases->map(fn ($p) => ['id' => $p->id, 'title' => $p->content['titulo'] ?? 'Presente', 'cliente' => $users[$p->user_id]?->name ?? 'Conta removida', 'status' => $p->status, 'amount_cents' => $p->amount_paid_cents ?? $p->price_cents, 'method' => $p->payment_method, 'created_at' => $p->created_at->toIso8601String()]),
            'plans' => $support ? [] : Plan::orderBy('sort_order')->get()->map(fn ($p) => ['id' => $p->id, 'nome' => $p->name, 'preco' => $p->price_cents / 100, 'desc' => $p->description, 'beneficios' => $p->features, 'fotos' => $p->photos_limit, 'videos' => $p->videos_limit, 'musicas' => $p->music_limit, 'destaque' => $p->featured, 'ativo' => $p->active, 'sort_order' => $p->sort_order]),
            'promos' => $support ? [] : Promotion::latest()->get()->map($mapOffer), 'coupons' => $support ? [] : Coupon::latest()->get()->map($mapOffer),
            'refunds' => $refunds->map(fn ($r) => ['id' => $r->id, 'purchaseId' => $r->purchase_id, 'cliente' => $users[$r->user_id]?->name ?? 'Conta removida', 'valor' => ($purchases->firstWhere('id', $r->purchase_id)?->amount_paid_cents ?? 0) / 100, 'motivo' => $r->reason, 'nota' => $r->review_note, 'status' => match ($r->status) {
                'approved' => 'aprovado','rejected' => 'recusado',default => 'pendente'
            }, 'ts' => $r->created_at->toIso8601String(), 'provider' => $checkouts->get($r->purchase_id)?->provider, 'kind' => $r->request_kind]),
            'tickets' => $tickets->map(fn ($t) => ['id' => $t->id, 'cliente' => $users[$t->user_id]?->name ?? 'Conta removida', 'assunto' => $t->subject, 'prioridade' => match ($t->priority) {
                'high' => 'alta','low' => 'baixa',default => 'media'
            }, 'status' => match ($t->status) {
                'closed' => 'resolvido','answered' => 'andamento',default => 'aberto'
            }, 'ts' => $t->created_at->toIso8601String(), 'msgs' => array_map(fn ($m) => ['who' => ($m['role'] ?? 'user') === 'admin' ? 'me' : 'them', 'txt' => $m['text'] ?? '', 'ts' => $m['at'] ?? 0], $t->messages ?? [])]),
            'themes' => collect(config('gift.themes'))->map(fn ($t, $id) => ['id' => $id, 'nome' => $t['nome'] ?? $t['name'] ?? ucfirst($id), 'ativo' => array_key_exists($id, $config->themes()), 'cor' => $t['cor'] ?? '#D4AF37'])->values(),
            'logs' => DB::table('admin_activities')->whereNull('deleted_at')->latest('id')->limit(500)->get()->map(fn ($l) => ['id' => $l->id, 'type' => $l->type, 'title' => $l->action, 'desc' => $l->target ?? '', 'by' => $users[$l->user_id]?->name ?? 'Sistema', 'ts' => $l->created_at]),
            'admins' => $level === 'owner' ? User::where('role', 'admin')->whereNull('deletion_requested_at')->get(['id', 'name', 'email', 'admin_level'])->map(fn ($u) => ['id' => $u->id, 'nome' => $u->name, 'email' => $u->email, 'role' => match ($u->admin_level) {
                'manager' => 'Gerente','support' => 'Suporte',default => 'Super Admin'
            }, 'avatar' => '']) : [],
            'invitations' => $level === 'owner' ? DB::table('admin_invitations')->whereNull('revoked_at')->whereNull('accepted_at')->where('expires_at', '>', now())->get(['id', 'email', 'level', 'expires_at']) : [],
            'limits' => PlanLimits::caps(),
            'settings' => $settings, 'history' => (object) [], 'me' => ['id' => $request->user()->id, 'nome' => $request->user()->name, 'email' => $request->user()->email, 'role' => match ($level) {
                'manager' => 'Gerente','support' => 'Suporte',default => 'Super Admin'
            }, 'level' => $level],
        ]);
    }

    public function settings(Request $request, AdminConfiguration $config)
    {
        DB::transaction(function () use ($request, $config) {
            $lockedUser = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $prefs = $request->validate(['dark' => 'sometimes|nullable|boolean', 'notifSeen' => 'sometimes|string|max:64', 'idleMin' => 'sometimes|integer|min:1|max:120', 'notifPix' => 'sometimes|boolean', 'notifRefund' => 'sometimes|boolean', 'notifTicket' => 'sometimes|boolean', 'notifCoupon' => 'sometimes|boolean']);
            $globalKeys = ['storeName', 'supportEmail', 'whatsapp', 'pixKey', 'refundDays', 'maintenance', 'emailNotif'];
            if (count(array_intersect($globalKeys, array_keys($request->all())))) {
                $this->owner($request);
                $global = $request->validate(['storeName' => 'sometimes|string|min:2|max:40', 'supportEmail' => 'sometimes|nullable|email:rfc|max:120', 'whatsapp' => 'sometimes|nullable|string|max:20', 'pixKey' => ['sometimes', 'nullable', 'string', 'max:77', function ($a, $v, $fail) {
                    if ($v && ! filter_var($v, FILTER_VALIDATE_EMAIL) && ! Str::isUuid($v) && ! preg_match('/\A(?:\+[1-9][0-9]{9,14}|[0-9]{11}|[0-9]{14})\z/', $v)) {
                        $fail('Chave Pix inválida.');
                    }
                }], 'refundDays' => 'sometimes|integer|min:1|max:90', 'maintenance' => 'sometimes|boolean', 'emailNotif' => 'sometimes|boolean']);
                if ($global['emailNotif'] ?? false) {
                    abort_if(in_array(config('mail.default'), ['log', 'array']), 422, 'Configure SMTP antes de habilitar alertas por e-mail.');
                }
                DB::table('admin_settings')->where('key', 'system')->lockForUpdate()->first();
                $updated = array_replace($config->all(), $global);
                abort_if($updated['emailNotif'] && ! $updated['supportEmail'], 422, 'Informe o e-mail que receberá os alertas.');
                $config->put('system', $updated);
            }
            if ($prefs) {
                $lockedUser->forceFill(['admin_preferences' => array_replace($lockedUser->admin_preferences ?? [], $prefs)])->save();
            }
        });
        $config->log('system', 'Configurações atualizadas');

        return $this->ok(['saved' => true]);
    }

    public function client(Request $request, User $user, string $operation, AdminConfiguration $config)
    {
        abort_unless($user->role === 'user', 404);
        if ($operation === 'note') {
            $data = $request->validate(['note' => 'nullable|string|max:2000']);
            $user->forceFill(['admin_note' => $data['note'] ?? ''])->save();
        } elseif ($operation === 'delete') {
            $this->owner($request);
            $request->validate(['confirmed' => 'required|accepted']);
            DB::transaction(function () use ($user) {
                $u = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
                $u->forceFill(['deletion_requested_at' => now(), 'remember_token' => null])->save();
                Purchase::where('user_id', $u->id)->delete();
                DB::table('sessions')->where('user_id', $u->id)->delete();
                DB::table('password_reset_tokens')->where('email', $u->email)->delete();
            });
        } else {
            abort(404);
        }
        $config->log('client', $operation === 'note' ? 'Observação atualizada' : 'Conta desativada', $user->id);

        return $this->ok(['saved' => true]);
    }

    public function ticket(Request $request, Ticket $ticket, AdminConfiguration $config)
    {
        $data = $request->validate(['priority' => 'sometimes|in:low,normal,high', 'status' => 'sometimes|in:open,answered,closed']);
        DB::transaction(fn () => Ticket::whereKey($ticket->id)->lockForUpdate()->firstOrFail()->update($data));
        $config->log('ticket', 'Atendimento atualizado', $ticket->id);

        return $this->ok(['saved' => true]);
    }

    public function theme(Request $request, string $theme, AdminConfiguration $config)
    {
        abort_unless(array_key_exists($theme, config('gift.themes')), 404);
        $data = $request->validate(['active' => 'required|boolean']);
        DB::transaction(function () use ($theme, $data, $config) {
            DB::table('admin_settings')->where('key', 'themes')->lockForUpdate()->first();
            $enabled = $config->themes();
            if ($data['active']) {
                $enabled[$theme] = true;
            } else {
                unset($enabled[$theme]);
            }abort_unless(count($enabled), 422, 'Mantenha pelo menos um tema ativo.');
            $config->put('themes', array_values(array_diff(array_keys(config('gift.themes')), array_keys($enabled))));
        });
        $config->log('theme', $data['active'] ? 'Tema ativado' : 'Tema desativado', $theme);

        return $this->ok(['saved' => true]);
    }

    public function rejectPix(Request $request, Purchase $purchase, AdminConfiguration $config)
    {
        $data = $request->validate(['reason' => 'required|string|min:5|max:300']);
        DB::transaction(function () use ($purchase, $data) {
            $p = Purchase::whereKey($purchase->id)->lockForUpdate()->firstOrFail();
            $c = PaymentCheckout::where('purchase_id', $p->id)->lockForUpdate()->firstOrFail();
            abort_unless($p->status === 'pending' && $c->provider === 'pix_manual' && $c->status === 'awaiting_confirmation', 409, 'Pedido não disponível para recusa.');
            $c->update(['status' => 'rejected', 'rejection_reason' => $data['reason']]);
        });
        $config->log('pix', 'Pix recusado após análise', $purchase->id);

        return $this->ok(['saved' => true]);
    }

    public function removeOffer(Request $request, string $kind, string $id, AdminConfiguration $config)
    {
        $model = match ($kind) {
            'plans' => Plan::class,'promotions' => Promotion::class,'coupons' => Coupon::class,default => abort(404)
        };
        DB::transaction(function () use ($model, $id, $kind) {
            Plan::orderBy('id')->lockForUpdate()->get();
            $row = $model::whereKey($id)->lockForUpdate()->firstOrFail();
            if ($kind === 'plans') {
                abort_if($row->active && Plan::where('active', true)->count() <= 1, 422, 'Mantenha um plano ativo.');
            }$row->update(['active' => false]);
            $row->delete();
        });
        $config->log(match ($kind) {
            'plans' => 'plan','promotions' => 'promo',default => 'coupon'
        }, 'Item arquivado', $id);

        return $this->ok(['saved' => true]);
    }

    public function clearActivities(Request $request, AdminConfiguration $config)
    {
        $this->owner($request);
        $request->validate(['confirmed' => 'required|accepted']);
        DB::table('admin_activities')->whereNull('deleted_at')->update(['deleted_at' => now()]);
        $config->log('system', 'Registro do painel limpo');

        return $this->ok(['saved' => true]);
    }

    public function invite(Request $request, AdminConfiguration $config)
    {
        $this->owner($request);
        $data = $request->validate(['email' => 'required|email:rfc|max:254', 'level' => 'required|in:owner,manager,support']);
        $email = strtolower(trim($data['email']));
        abort_if(User::where('email', $email)->where('role', 'admin')->exists(), 409, 'Esta conta já é administradora.');
        abort_if(in_array(config('mail.default'), ['log', 'array']) && app()->isProduction(), 422, 'Configure SMTP para enviar o convite.');
        $id = (string) Str::uuid();
        DB::table('admin_invitations')->insert(['id' => $id, 'email' => $email, 'level' => $data['level'], 'invited_by' => $request->user()->id, 'expires_at' => now()->addDays(2), 'created_at' => now(), 'updated_at' => now()]);
        $url = URL::temporarySignedRoute('admin.invitation', now()->addDays(2), ['invitation' => $id]);
        try {
            Mail::to($email)->send(new AdminInvitationMail($url));
        } catch (\Throwable) {
            DB::table('admin_invitations')->where('id', $id)->delete();
            abort(503, 'Não foi possível enviar o convite. Verifique SMTP.');
        }
        $config->log('admin', 'Convite enviado', $id);

        return $this->ok(['sent' => true]);
    }

    public function acceptInvitation(Request $request, string $invitation, AdminConfiguration $config)
    {
        abort_unless($request->hasValidSignature(), 403);
        if (! $request->user()) {
            return redirect('/login.html');
        }
        $i = DB::table('admin_invitations')->where('id', $invitation)->first();
        abort_unless($i && $i->email === $request->user()->email && ! $i->accepted_at && ! $i->revoked_at && now()->lt($i->expires_at), 403);

        return response()->view('admin.invitation', ['invitation' => $invitation]);
    }

    public function accept(Request $request, string $invitation, AdminConfiguration $config)
    {
        $request->validate(['confirmed' => 'required|accepted']);
        DB::transaction(function () use ($invitation, $request) {
            $i = DB::table('admin_invitations')->where('id', $invitation)->lockForUpdate()->first();
            abort_unless($i && $i->email === $request->user()->email && ! $i->accepted_at && ! $i->revoked_at && now()->lt($i->expires_at), 403);
            $request->user()->forceFill(['role' => 'admin', 'admin_level' => $i->level])->save();
            DB::table('admin_invitations')->where('id', $invitation)->update(['accepted_at' => now()]);
        });
        $request->session()->regenerate();
        $config->log('admin', 'Convite aceito', $invitation);

        return redirect('/admin/dashboard.html');
    }

    public function revokeInvitation(Request $request, string $invitation, AdminConfiguration $config)
    {
        $this->owner($request);
        $changed = DB::table('admin_invitations')->where('id', $invitation)->whereNull('accepted_at')->whereNull('revoked_at')->update(['revoked_at' => now()]);
        abort_unless($changed, 409, 'Convite já aceito ou revogado.');
        $config->log('admin', 'Convite revogado', $invitation);

        return $this->ok(['saved' => true]);
    }

    public function removeAdmin(Request $request, User $user, AdminConfiguration $config)
    {
        $this->owner($request);
        abort_if($user->id === $request->user()->id, 422, 'Não remova seu próprio acesso.');
        DB::transaction(function () use ($user) {
            $admins = User::where('role', 'admin')->orderBy('id')->lockForUpdate()->get();
            $u = $admins->firstWhere('id', $user->id);
            abort_unless($u, 404);
            if (($u->admin_level ?? 'owner') === 'owner') {
                abort_unless($admins->filter(fn ($a) => ($a->admin_level ?? 'owner') === 'owner')->count() > 1, 422, 'Mantenha pelo menos um Super Admin.');
            }
            $u->forceFill(['role' => 'user', 'admin_level' => null])->save();
            DB::table('sessions')->where('user_id', $u->id)->delete();
        });
        $config->log('admin', 'Acesso administrativo removido', $user->id);

        return $this->ok(['saved' => true]);
    }

    private function owner(Request $request): void
    {
        abort_unless(($request->user()->admin_level ?? 'owner') === 'owner', 403, 'Somente Super Admin.');
    }
}
