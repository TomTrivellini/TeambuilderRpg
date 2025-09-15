
export const STATUS_DEFINITIONS = {
  poison: {
    id: 'poison',
    name: 'Veneno',
    color: '#2ecc71',
    // Daño por nivel y stack
    getDamage: (level) => ({ 1: 5, 2: 10, 3: 15 }[level] || 0),
    // Duración en turnos por nivel
    getDuration: (level) => ({ 1: 3, 2: 5, 3: 7 }[level] || 0),
  },
  burn: {
    id: 'burn',
    name: 'Quemadura',
    color: '#ff6b6b',
    getDamage: (level) => ({ 1: 4, 2: 8, 3: 12 }[level] || 0),
    getDuration: (level) => ({ 1: 3, 2: 4, 3: 5 }[level] || 0),
  },
  confused: {
    id: 'confused',
    name: 'Confusión',
    color: '#a55eea',
    getDuration: (level) => 1, 
  },
  marked: {
    id: 'marked',
    name: 'Marcado',
    color: '#ff4757',
    getDuration: (level) => 2, // Dura 2 turnos del personaje marcado
  },
  
};