/* =====================================================
   plan-limits.js — cotas de mídia dos planos (contrato: docs/PRICING.md)
   - Fonte única: plan.photos_limit/videos_limit/music_limit ou
     GET /api/config data.plan_limits.
   - Sem DOM e sem quantidades fixas: quando a configuração não
     chegou, as funções retornam null e a página pede recarga.
   ===================================================== */
(function () {
  const scope = typeof window !== "undefined" ? window : globalThis;
  const MEDIA = [
    { key: "photos", planKey: "photos_limit", one: "foto", many: "fotos" },
    { key: "videos", planKey: "videos_limit", one: "vídeo", many: "vídeos" },
    { key: "music", planKey: "music_limit", one: "música", many: "músicas" },
  ];

  function toCount(value) {
    const count = Number(value);
    return Number.isFinite(count) && count >= 0 ? Math.floor(count) : null;
  }

  /* Limites numéricos de um plano (objeto de /api/config ou snapshot do pedido). */
  function fromPlan(plan) {
    if (!plan || typeof plan !== "object") return null;
    const limits = {};
    for (const media of MEDIA) {
      const value = toCount(plan[media.planKey]);
      if (value === null) return null;
      limits[media.key] = value;
    }
    return limits;
  }

  function normalizeConfigLimits(raw) {
    if (!raw || typeof raw !== "object") return null;
    const normalized = {};
    for (const section of ["min", "max", "defaults"]) {
      const source = raw[section];
      if (!source || typeof source !== "object") return null;
      normalized[section] = {};
      for (const media of MEDIA) {
        const value = toCount(source[media.key] ?? source[media.planKey]);
        if (value === null) return null;
        normalized[section][media.key] = value;
      }
    }
    return normalized;
  }

  /* Limites do catálogo publicados em GET /api/config data.plan_limits. */
  function fromConfig() {
    return normalizeConfigLimits(scope.NA_PRICING && scope.NA_PRICING.limits);
  }

  function label(count, one, many) {
    return count + " " + (count === 1 ? one : many);
  }

  /* Resumo legível com singular/plural corretos para as cotas do plano. */
  function summary(plan) {
    const limits = fromPlan(plan);
    if (!limits) return null;
    const parts = [label(limits.photos, "foto", "fotos"), label(limits.videos, "vídeo", "vídeos")];
    if (limits.music) parts.push(label(limits.music, "música", "músicas"));
    const text = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(", ") + " e " + parts.at(-1);
    return limits.music ? text : text + " (sem música)";
  }

  /* Textos neutros dos uploads, por tipo de mídia. */
  function hint(plan) {
    const limits = fromPlan(plan);
    if (!limits) return null;
    return {
      fotos: limits.photos
        ? (limits.photos === 1 ? "1 imagem" : "Até " + limits.photos + " imagens") + " · escolha a capa abaixo"
        : "Fotos não estão incluídas neste plano",
      videos: limits.videos
        ? (limits.videos === 1 ? "1 vídeo" : "Até " + limits.videos + " vídeos") + (limits.videos === 1 ? " · opcional" : " · opcionais")
        : "Vídeos não estão incluídos neste plano",
      musica: limits.music
        ? (limits.music === 1 ? "1 música" : "Até " + limits.music + " músicas") + " · opcional"
        : "Música não está incluída neste plano",
    };
  }

  /* Mensagem de um único tipo de mídia, usando a cota do plano. */
  function limitMessage(plan, kind) {
    const limits = fromPlan(plan);
    if (!limits) return null;
    const media = MEDIA.find((item) => item.key === kind || item.planKey === kind);
    if (!media) return null;
    return "Máximo de " + label(limits[media.key], media.one, media.many) + ".";
  }

  /* Mensagem de bloqueio no envio, com as cotas reais do plano. */
  function failureMessage(plan) {
    const text = summary(plan);
    return text ? "As mídias ultrapassam os limites deste plano: até " + text + "." : null;
  }

  /* Quais mídias usadas (contagens ou booleanos) passam do plano. */
  function overLimit(plan, used) {
    const limits = fromPlan(plan);
    if (!limits || !used || typeof used !== "object") return null;
    const exceeded = {};
    let any = false;
    for (const media of MEDIA) {
      const raw = used[media.key];
      const value = typeof raw === "boolean" ? (raw ? 1 : 0) : toCount(raw ?? 0);
      if (value === null) continue;
      exceeded[media.key] = value > limits[media.key];
      any = any || exceeded[media.key];
    }
    return any ? exceeded : null;
  }

  scope.NAPlanLimits = { MEDIA, fromPlan, fromConfig, summary, hint, limitMessage, failureMessage, overLimit };
})();
