<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupportController extends ApiController
{
    public function show(Request $request)
    {
        return $this->ok(['user_id' => $request->user()->id, 'ticket' => $this->project($this->current($request->user()->id))])->header('Cache-Control', 'private, no-store');
    }

    public function start(Request $request)
    {
        $data = $request->validate([
            'text' => 'required|string|min:3|max:2000', 'message_id' => 'required|uuid',
            'category' => 'required|in:payment,media,account,refund,themes,creation,sharing,other',
            'page' => ['required', 'string', 'max:100', 'regex:~\A/[a-zA-Z0-9_/-]+\.html\z~'],
            'context' => 'sometimes|array|max:3', 'context.*' => 'string|max:500',
        ]);
        $ticket = DB::transaction(function () use ($request, $data) {
            // Serialize first creation for this account without a new public identifier.
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $ticket = $this->current($request->user()->id, true);
            if (! $ticket || count($ticket->messages ?? []) >= 498) {
                $ticket = Ticket::create(['id' => 't_'.Str::uuid(), 'user_id' => $request->user()->id,
                    'subject' => $this->category($data['category']), 'status' => 'open', 'messages' => [
                        ['id' => (string) Str::uuid(), 'role' => 'system', 'text' => 'Assunto: '.$this->category($data['category']).' | Página: '.$data['page'], 'at' => now()->getTimestampMs()],
                        ...array_map(fn ($text) => ['id' => (string) Str::uuid(), 'role' => 'context', 'text' => $text, 'at' => now()->getTimestampMs()], $data['context'] ?? []),
                    ]]);
            }
            $this->append($ticket, $data);

            return $ticket;
        });

        return $this->ok(['user_id' => $request->user()->id, 'ticket' => $this->project($ticket)])->header('Cache-Control', 'private, no-store');
    }

    public function message(Request $request)
    {
        $data = $request->validate(['text' => 'required|string|min:1|max:2000', 'message_id' => 'required|uuid']);
        $ticket = DB::transaction(function () use ($request, $data) {
            $ticket = $this->current($request->user()->id, true);
            abort_unless($ticket, 409, 'Inicie o atendimento antes de enviar uma mensagem.');
            $this->append($ticket, $data);

            return $ticket;
        });

        return $this->ok(['user_id' => $request->user()->id, 'ticket' => $this->project($ticket)])->header('Cache-Control', 'private, no-store');
    }

    private function append(Ticket $ticket, array $data): void
    {
        $messages = $ticket->messages ?? [];
        if (collect($messages)->contains('id', $data['message_id'])) {
            return;
        }
        abort_if(count($messages) >= 498, 409, 'Este atendimento atingiu o limite de mensagens. Volte ao assistente e selecione Falar com suporte para iniciar outro atendimento.');
        $messages[] = ['id' => $data['message_id'], 'role' => 'user', 'text' => $data['text'], 'at' => now()->getTimestampMs()];
        $ticket->update(['messages' => $messages, 'status' => 'open']);
    }

    private function current(int $userId, bool $lock = false): ?Ticket
    {
        $query = Ticket::where('user_id', $userId)->whereIn('status', ['open', 'answered'])->latest('created_at')->orderByDesc('id');

        return ($lock ? $query->lockForUpdate() : $query)->first();
    }

    private function project(?Ticket $ticket): ?array
    {
        return $ticket ? $ticket->only(['id', 'subject', 'status', 'messages']) : null;
    }

    private function category(string $category): string
    {
        return ['payment' => 'Pagamento', 'media' => 'Fotos, vídeos e música', 'account' => 'Conta e acesso', 'refund' => 'Reembolso', 'themes' => 'Temas', 'creation' => 'Criação do presente', 'sharing' => 'Link e QR Code', 'other' => 'Outras dúvidas'][$category];
    }
}
