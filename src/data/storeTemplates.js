// src/data/storeTemplates.js

export const STORE_TEMPLATES = [
  {
    id: 'fast_food',
    name: 'Hamburguesería & Fast Food',
    icon: '🍔',
    description: 'Hamburguesas smash, papas fritas, combos, bebidas y postres.',
    theme: {
      primaryColor: '#f59e0b',
      primaryColorText: '#ffffff',
      accentColor: '#10b981',
      bgDark: '#0b0f19',
      surfaceDark: '#131b2e',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    },
    categories: ['Hamburguesas', 'Papas & Acompañamientos', 'Bebidas', 'Promociones'],
    sampleProducts: [
      { name: 'Hamburguesa Clásica Doble', category: 'Hamburguesas', price: 7500, emoji: '🍔', description: 'Doble medallón, cheddar, lechuga y tomate' },
      { name: 'Hamburguesa Bacon Crispy', category: 'Hamburguesas', price: 9200, emoji: '🥓', description: 'Doble carne, cuádruple cheddar, bacon crocante y BBQ' },
      { name: 'Papas Rústicas con Cheddar', category: 'Papas & Acompañamientos', price: 4200, emoji: '🍟', description: 'Papas con salsa cheddar fundida y ciboulette' },
      { name: 'Gaseosa 500ml', category: 'Bebidas', price: 1800, emoji: '🥤', description: 'Línea Coca-Cola' }
    ]
  },
  {
    id: 'pizzeria',
    name: 'Pizzería & Casas de Empanadas',
    icon: '🍕',
    description: 'Pizzas a la piedra o molde, empanadas por docena, faina y bebidas.',
    theme: {
      primaryColor: '#e11d48',
      primaryColorText: '#ffffff',
      accentColor: '#f59e0b',
      bgDark: '#0f172a',
      surfaceDark: '#1e293b',
      fontFamily: "'Outfit', sans-serif"
    },
    categories: ['Pizzas Tradicionales', 'Pizzas Especiales', 'Empanadas', 'Bebidas'],
    sampleProducts: [
      { name: 'Pizza Muzzarella', category: 'Pizzas Tradicionales', price: 9800, emoji: '🍕', description: 'Salsa casera de tomate, doble muzzarella, orégano y aceitunas' },
      { name: 'Pizza Especial de Jamón y Morrones', category: 'Pizzas Especiales', price: 12500, emoji: '🍕', description: 'Muzzarella, jamón cocido seleccionado y morrones asados' },
      { name: 'Docena de Empanadas Criollas', category: 'Empanadas', price: 14000, emoji: '🥟', description: '12 unidades cortadas a cuchillo o suaves' },
      { name: 'Cerveza 1 Litro', category: 'Bebidas', price: 3500, emoji: '🍺', description: 'Bien helada' }
    ]
  },
  {
    id: 'rotiseria',
    name: 'Rotisería & Platos del Día',
    icon: '🍗',
    description: 'Comidas caseras, pollo al spiedo, milanesas, pastas y minutas.',
    theme: {
      primaryColor: '#d97706',
      primaryColorText: '#ffffff',
      accentColor: '#059669',
      bgDark: '#18181b',
      surfaceDark: '#27272a',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    },
    categories: ['Platos del Día', 'Minutas', 'Tartas & Pastas', 'Guarniciones'],
    sampleProducts: [
      { name: 'Pollo al Spiedo con Papas', category: 'Platos del Día', price: 11000, emoji: '🍗', description: 'Pollo entero dorado con papas al horno provenzal' },
      { name: 'Milanesa Napolitana con Fritas', category: 'Minutas', price: 8900, emoji: '🥩', description: 'Para compartir con salsa, jamón y queso gratinado' },
      { name: 'Tarta de Acelga y Ricota', category: 'Tartas & Pastas', price: 5500, emoji: '🥧', description: 'Porción abundante casera' },
      { name: 'Porción de Puré Mixto', category: 'Guarniciones', price: 2900, emoji: '🥔', description: 'Papa y calabaza con manteca' }
    ]
  },
  {
    id: 'restaurant',
    name: 'Restaurante & Bar con Salón',
    icon: '🍽️',
    description: 'Gestión de mesas, platos elaborados, entradas, cortes y cócteles.',
    theme: {
      primaryColor: '#3b82f6',
      primaryColorText: '#ffffff',
      accentColor: '#10b981',
      bgDark: '#0a0f1d',
      surfaceDark: '#151d33',
      fontFamily: "'Inter', sans-serif"
    },
    categories: ['Entradas', 'Platos Principales', 'Cortes a la Parrilla', 'Bebidas & Tragos', 'Postres'],
    sampleProducts: [
      { name: 'Bife de Chorizo con Guarnición', category: 'Cortes a la Parrilla', price: 16500, emoji: '🥩', description: '400g punto a elección con papas o ensalada mixta' },
      { name: 'Ravioles de Salmón con Salsa Crema', category: 'Platos Principales', price: 13900, emoji: '🍝', description: 'Pasta fresca artesanal con suave crema de hierbas' },
      { name: 'Fernet Branca con Cola', category: 'Bebidas & Tragos', price: 4500, emoji: '🥃', description: 'En vaso de acero con mucho hielo' },
      { name: 'Volcán de Chocolate con Americana', category: 'Postres', price: 4800, emoji: '🍫', description: 'Centro tibio fundido con bocha de helado' }
    ]
  }
];
