<?php

namespace App\Services;

use App\Models\Purchase;

class RefundEligibility
{
    public function forPurchase(Purchase $purchase): array
    {
        $deadline = $purchase->paid_at?->copy()->addHours(72);
        $paid = $purchase->status === 'paid' && ! $purchase->trashed();
        $tracked = $purchase->paid_at && $purchase->share_tracking_started_at
            && $purchase->paid_at->getTimestamp() >= $purchase->share_tracking_started_at->getTimestamp();
        $reason = match (true) {
            ! $paid => 'not_paid',
            ! $deadline => 'payment_date_unknown',
            (bool) $purchase->first_shared_opened_at => 'link_opened',
            now()->greaterThanOrEqualTo($deadline) => 'expired',
            ! $tracked => 'tracking_unverified',
            default => null,
        };

        return ['eligible' => $reason === null, 'reason' => $reason, 'expires_at' => $deadline?->getTimestampMs(),
            'first_opened_at' => $purchase->first_shared_opened_at?->getTimestampMs(), 'legal_review_available' => $paid,
            'server_time_ms' => now()->getTimestampMs()];
    }

    public function message(?string $reason): string
    {
        return match ($reason) {
            'link_opened' => 'O link compartilhado já foi aberto. A garantia comercial não está mais disponível. Você pode solicitar análise dos seus direitos legais.',
            'expired' => 'O prazo da garantia comercial de 3 dias terminou. Você pode solicitar análise dos seus direitos legais.',
            'tracking_unverified', 'payment_date_unknown' => 'Não há histórico suficiente para validar a garantia comercial. Solicite uma análise dos seus direitos legais.',
            default => 'Esta compra não está disponível para solicitação de reembolso.',
        };
    }
}
