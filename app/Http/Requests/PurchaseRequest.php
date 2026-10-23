<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'tema' => ['required', 'string', Rule::in(array_keys(config('gift.themes')))],
            'para' => 'required|string|max:60', 'de' => 'nullable|string|max:60', 'titulo' => 'nullable|string|max:80',
            'inicio' => 'nullable|date_format:Y-m-d', 'carta' => 'nullable|string|max:4000',
            'frase' => 'nullable|string|max:'.($this->input('tema') === 'netflix' ? 600 : 90),
            'rodapeCustom' => 'nullable|string|max:500', 'musicaNome' => 'nullable|string|max:100', 'musicaArtista' => 'nullable|string|max:100',
            'usarIntro' => 'sometimes|boolean', 'autoplay' => 'sometimes|boolean', 'fotoCapa' => 'sometimes|integer|min:0|max:11',
            'eventos' => 'sometimes|array|max:6', 'eventos.*.data' => 'nullable|string|max:30', 'eventos.*.titulo' => 'nullable|string|max:50', 'eventos.*.texto' => 'nullable|string|max:800',
            'amo' => 'sometimes|array|max:20', 'amo.*' => 'string|max:500', 'legendas' => 'sometimes|array|max:12', 'legendas.*' => 'nullable|string|max:60',
            'themeData' => ['nullable', 'array', function ($attribute, $value, $fail) {
                if (strlen(json_encode($value)) > 200000) {
                    $fail('Detalhes do tema muito extensos.');
                }$walk = function ($node, $depth = 0) use (&$walk, $fail) {
                    if ($depth > 10) {
                        $fail('Detalhes do tema muito profundos.');

                        return;
                    }if (is_array($node)) {
                        if (count($node) > 300) {
                            $fail('Detalhes do tema muito extensos.');
                        }foreach ($node as $key => $item) {
                            if (in_array($key, ['__proto__', 'constructor', 'prototype'], true)) {
                                $fail('Chave inválida.');
                            }$walk($item, $depth + 1);
                        }
                    } elseif (is_string($node) && mb_strlen($node) > 4000) {
                        $fail('Texto de detalhe muito extenso.');
                    }
                };
                $walk($value);
            }],
            'client_request_id' => 'nullable|string|regex:/^[\w-]{16,100}$/',
            'preview_data_url' => ['nullable', 'string', 'max:200000', 'regex:/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/'],
            'media' => 'sometimes|array', 'media.photos' => 'sometimes|array|min:1|max:12', 'media.photos.*' => 'string|max:100',
            'media.videos' => 'sometimes|array|max:4', 'media.videos.*' => 'string|max:100', 'media.music' => 'nullable|string|max:100',
        ];
    }

    public function content(): array
    {
        return collect($this->validated())->except(['client_request_id', 'media'])->all();
    }
}
