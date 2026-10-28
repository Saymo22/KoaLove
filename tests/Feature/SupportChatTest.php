<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SupportChatTest extends TestCase
{
    use RefreshDatabase;

    private function payload(): array
    {
        return ['text' => 'Não consigo enviar o vídeo no formulário.', 'message_id' => (string) Str::uuid(), 'category' => 'media', 'page' => '/criar-presente', 'context' => ['Quais formatos posso usar?']];
    }

    public function test_handoff_and_admin_reply_are_visible_only_to_the_owner(): void
    {
        $owner = User::factory()->create();
        $data = $this->payload();
        $response = $this->actingAs($owner)->postJson('/api/support/start', [...$data, 'user_id' => 999, 'status' => 'answered']);
        $response->assertOk()->assertJsonPath('data.user_id', $owner->id)->assertJsonPath('data.ticket.status', 'open')->assertJsonPath('data.ticket.subject', 'Fotos, vídeos e música');
        $id = $response->json('data.ticket.id');
        $this->postJson('/api/support/start', $data)->assertOk();
        $this->assertDatabaseCount('tickets', 1);
        $this->assertCount(3, Ticket::findOrFail($id)->messages);
        $this->getJson('/api/support')->assertOk()->assertHeader('Cache-Control', 'no-store, private')->assertJsonPath('data.ticket.messages.2.text', $data['text']);
        $other = User::factory()->create();
        $this->actingAs($other)->getJson('/api/support')->assertOk()->assertJsonPath('data.ticket', null);
        $this->postJson('/api/support/messages', ['text' => 'Tentativa de responder outro ticket', 'message_id' => (string) Str::uuid(), 'ticket_id' => $id])->assertConflict();
        $this->postJson('/api/admin/tickets/'.$id.'/reply', ['text' => 'Resposta não autorizada'])->assertForbidden();
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->getJson('/api/admin/tickets')->assertOk()->assertJsonPath('data.tickets.0.id', $id);
        $this->postJson('/api/admin/tickets/'.$id.'/reply', ['text' => 'Confira o limite do arquivo informado no formulário.'])->assertOk();
        $this->actingAs($owner)->getJson('/api/support')->assertOk()->assertJsonPath('data.ticket.status', 'answered')->assertJsonPath('data.ticket.messages.3.role', 'admin')->assertJsonPath('data.ticket.messages.3.text', 'Confira o limite do arquivo informado no formulário.');
        $followup = ['text' => 'O vídeo tem 10 MB.', 'message_id' => (string) Str::uuid()];
        $this->postJson('/api/support/messages', $followup)->assertOk()->assertJsonPath('data.ticket.status', 'open');
        $this->postJson('/api/support/messages', $followup)->assertOk();
        $this->assertCount(5, Ticket::findOrFail($id)->messages);
    }

    public function test_guest_and_deleted_account_cannot_read_or_write_private_support(): void
    {
        $this->getJson('/api/support')->assertUnauthorized();
        $this->postJson('/api/support/start', $this->payload())->assertUnauthorized();
        $this->postJson('/api/support/messages', ['text' => 'Olá', 'message_id' => (string) Str::uuid()])->assertUnauthorized();
        $this->actingAs(User::factory()->create(['deletion_requested_at' => now()]));
        $this->getJson('/api/support')->assertUnauthorized();
        $this->postJson('/api/support/start', $this->payload())->assertUnauthorized();
        $this->assertDatabaseCount('tickets', 0);
    }

    public function test_triage_rejects_urls_tokens_excessive_context_and_invalid_ids(): void
    {
        $this->actingAs(User::factory()->create());
        foreach ([['page', '/presente?token=secret'], ['page', '/criar-presente.html'], ['category', 'injected'], ['message_id', 'invalid'], ['context', ['1', '2', '3', '4']], ['text', str_repeat('x', 2001)]] as [$field, $value]) {
            $this->postJson('/api/support/start', [...$this->payload(), $field => $value])->assertUnprocessable();
        }
        $this->assertDatabaseCount('tickets', 0);
    }

    public function test_support_uses_rate_limits_and_preserves_full_conversations(): void
    {
        $owner = User::factory()->create();
        $this->actingAs($owner)->postJson('/api/support/start', $this->payload())->assertOk();
        for ($i = 0; $i < 9; $i++) {
            $this->postJson('/api/support/messages', ['text' => 'Mensagem '.$i, 'message_id' => (string) Str::uuid()])->assertOk();
        }
        $this->postJson('/api/support/messages', ['text' => 'Mensagem excedente', 'message_id' => (string) Str::uuid()])->assertTooManyRequests();
        $this->getJson('/api/support')->assertOk();
        $this->assertCount(12, Ticket::firstOrFail()->messages);
    }
}
