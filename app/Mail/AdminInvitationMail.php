<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class AdminInvitationMail extends Mailable
{
    public function __construct(public string $invitationUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Convite para o painel KoaLove');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.admin-invitation');
    }
}
