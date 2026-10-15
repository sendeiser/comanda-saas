// =========================================================
// WHATSAPP SMART ORDER PARSER (NLP & REGEX)
// Convierte mensajes desestructurados de chat en pedidos cargados
// =========================================================

export const whatsappParserService = {
  parseMessage(text, availableProducts = []) {
    if (!text || typeof text !== 'string') return null;

    const raw = text.trim();
    const lines = raw.split(/\r?\n/);
    
    let detectedCustomer = {
      name: '',
      address: '',
      phone: '',
      notes: ''
    };

    let detectedPayment = 'efectivo';
    let transferConfirmed = false;
    let transferProof = '';
    let detectedItems = [];
    let detectedChannel = 'whatsapp';
    let detectedTableNumber = '';

    // 1. Detectar canal (mesa, mostrador, delivery) y número de mesa
    const mesaMatch = raw.match(/(?:🪑\s*)?(?:mesa|ubicaci[oó]n|barra)\s*:?\s*(?:mesa\s*)?([A-Za-z0-9\-]+)/i);
    if (mesaMatch) {
      detectedChannel = 'mesa';
      detectedTableNumber = mesaMatch[1].trim();
    } else if (/(?:comer\s*en\s*el\s*local|en\s*mesa|consumo\s*en\s*el\s*local)/i.test(raw)) {
      detectedChannel = 'mesa';
    } else if (/(?:para\s*llevar|retiro\s*en\s*el\s*local|mostrador)/i.test(raw)) {
      detectedChannel = 'mostrador';
    } else if (/(?:delivery|env[ií]o|cadete|domicilio)/i.test(raw)) {
      detectedChannel = 'whatsapp';
    }

    // 2. Detectar datos de entrega y cliente
    const addressMatch = raw.match(/(?:direcci[oó]n|env[ií]o|calle|domicilio|a|para)\s*:?\s*([A-Za-z0-9\s\.,°º]+?)(?:\n|$|,|pago|telefono|cel)/i);
    if (addressMatch) {
      detectedCustomer.address = addressMatch[1].trim();
    }

    const phoneMatch = raw.match(/(?:tel[eé]fono|cel(?:ular)?|wa|wpp|nro)\s*:?\s*([0-9\+\s\-]{7,20})/i);
    if (phoneMatch) {
      detectedCustomer.phone = phoneMatch[1].replace(/\s+/g, '').trim();
    }

    const nameMatch = raw.match(/(?:nombre|soy|de parte de|cliente)\s*:?\s*([A-Za-zÀ-ÿ\s]{3,30})/i);
    if (nameMatch) {
      detectedCustomer.name = nameMatch[1].trim();
    }

    // 3. Detectar Medio de Pago
    if (/transferencia|alias|mp|mercado\s*pago|cbu|cvu|deposito/i.test(raw)) {
      detectedPayment = 'transferencia';
      if (/comprobante|acreditad[ao]|adjunto|ya\s*te\s*transfer[ií]|pagado/i.test(raw)) {
        transferConfirmed = true;
      }
    } else if (/tarjeta|posnet|debito|credito/i.test(raw)) {
      detectedPayment = 'tarjeta';
    }

    // 3. Detectar Productos y Cantidades
    const norm = (s) => (s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/burguers?/gi, 'burger')
      .replace(/hamburguesas?/gi, 'burger')
      .replace(/birras?/gi, 'cerveza')
      .replace(/cervezas/gi, 'cerveza')
      .replace(/chedar/gi, 'cheddar')
      .replace(/fritas/gi, '')
      .replace(/porci[oó]n\s+de\s+/gi, '')
      .trim();

    let cleanRaw = norm(raw);
    const wordNumbers = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6 };
    for (const [w, n] of Object.entries(wordNumbers)) {
      cleanRaw = cleanRaw.replace(new RegExp(`\\b${w}\\b`, 'gi'), n);
    }

    const sortedProds = [...availableProducts].sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));

    sortedProds.forEach(prod => {
      const pNorm = norm(prod.name);
      const stopWords = new Set(['con', 'las', 'los', 'del', 'para', 'sin', '473ml', '500ml', '1.5l', '2l', 'bacon']);
      const kws = pNorm.split(/[^\w]+/).filter(w => w.length >= 3 && !stopWords.has(w));
      if (kws.length === 0) return;

      const minMatches = kws.length >= 2 ? 2 : 1;
      const matchedCount = kws.filter(kw => cleanRaw.includes(kw)).length;

      if (matchedCount >= minMatches) {
        const firstKw = kws[0];
        const qtyRegex = new RegExp(`(\\d+)\\s*(?:de\\s+)?(?:\\w+\\s+){0,2}${firstKw}`);
        const qtyMatch = cleanRaw.match(qtyRegex);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

        // Check for modifiers in the surrounding text or global message
        let modifiers = [];
        if (/sin\s*cebolla/i.test(raw)) modifiers.push('Sin cebolla');
        if (/sin\s*tomate/i.test(raw)) modifiers.push('Sin tomate');
        if (/extra\s*cheddar|con\s*mucho\s*cheddar/i.test(raw)) modifiers.push('Extra Cheddar (+$800)');
        if (/extra\s*bacon|con\s*bacon/i.test(raw)) modifiers.push('Extra Bacon (+$900)');
        if (/bien\s*cocida/i.test(raw)) modifiers.push('Bien cocida');

        // Avoid duplicate product additions
        if (!detectedItems.some(i => i.productId === prod.id)) {
          detectedItems.push({
            productId: prod.id,
            name: prod.name,
            unitPrice: prod.price,
            qty: Math.max(1, qty),
            modifiers,
            notes: '',
            image: prod.image || '',
            emoji: prod.emoji || '🍔'
          });
        }
      }
    });

    return {
      customer: detectedCustomer,
      paymentMethod: detectedPayment,
      transferConfirmed,
      transferProof,
      items: detectedItems,
      channel: detectedChannel,
      tableNumber: detectedTableNumber,
      rawText: raw
    };
  }
};
