import { useState } from 'react';
import { SpriteCanvas } from './ui/SpriteCanvas';

function ConsumablesSection({ inventory, selectedCharacterId, useConsumable }) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const consumables = inventory.filter(item => item.type === 'consumable');

  const groupedConsumables = consumables.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = { ...item, count: 0 };
    }
    acc[item.id].count++;
    return acc;
  }, {});

  const handleUseItem = () => {
    if (selectedCharacterId && selectedItemId) {
      useConsumable(selectedCharacterId, selectedItemId);
      setSelectedItemId(null); // Deseleccionar después de usar
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4 style={{ marginBottom: 8, fontSize: 14, opacity: 0.9 }}>Consumibles</h4>
      <div className="scrollable-list" style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: 8 }}>
        {consumables.length > 0 ? (
          Object.values(groupedConsumables).map(item => {
            const isSelected = selectedItemId === item.id;
            const isHovered = hoveredItemId === item.id;

            let background = 'transparent';
            if (isSelected) {
              background = 'rgba(255, 255, 255, 0.1)';
            } else if (isHovered) {
              background = 'rgba(255, 255, 255, 0.05)';
            }

            return (
              <div
                key={item.id}
                style={{
                  padding: '6px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  border: isSelected ? '1px solid #fff' : '1px solid transparent',
                  background: background,
                  transition: 'background 0.1s',
                }}
                onClick={() => setSelectedItemId(item.id)}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <span style={{ fontSize: 14 }}>{item.name} ({item.count})</span>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: 12, opacity: 0.6, textAlign: 'center', padding: '1rem 0' }}>
            No tienes consumibles.
          </div>
        )}
      </div>
      <button
        style={{ width: '100%', marginTop: 8 }}
        onClick={handleUseItem}
        disabled={!selectedCharacterId || !selectedItemId}
      >
        Usar
      </button>
    </div>
  );
}

function EquipablesSection({ inventory, selectedCharacterId, equipItem, allies }) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const equipables = inventory.filter(item => item.type === 'equipable');

  const groupedEquipables = equipables.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = { ...item, count: 0 };
    }
    acc[item.id].count++;
    return acc;
  }, {});

  const isAllySelected = selectedCharacterId && allies.some(a => a.id === selectedCharacterId);

  const handleEquipItem = () => {
    if (isAllySelected && selectedItemId) {
      equipItem(selectedCharacterId, selectedItemId);
      setSelectedItemId(null); // Deseleccionar después de usar
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4 style={{ marginBottom: 8, fontSize: 14, opacity: 0.9 }}>Equipables</h4>
      <div className="scrollable-list" style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: 8 }}>
        {equipables.length > 0 ? (
          Object.values(groupedEquipables).map(item => {
            const isSelected = selectedItemId === item.id;
            const isHovered = hoveredItemId === item.id;

            let background = 'transparent';
            if (isSelected) {
              background = 'rgba(255, 255, 255, 0.1)';
            } else if (isHovered) {
              background = 'rgba(255, 255, 255, 0.05)';
            }

            return (
              <div
                key={item.id}
                style={{
                  padding: '6px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  border: isSelected ? '1px solid #fff' : '1px solid transparent',
                  background: background,
                  transition: 'background 0.1s',
                }}
                onClick={() => setSelectedItemId(item.id)}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <span style={{ fontSize: 14 }}>{item.name} ({item.count})</span>
              </div>
            );
          })
        ) : (
          <div style={{ fontSize: 12, opacity: 0.6, textAlign: 'center', padding: '1rem 0' }}>
            No tienes equipables.
          </div>
        )}
      </div>
      <button
        style={{ width: '100%', marginTop: 8 }}
        onClick={handleEquipItem}
        disabled={!isAllySelected || !selectedItemId}
      >
        Equipar
      </button>
    </div>
  );
}

export function InventoryDisplay({ allies, selectedCharacterId, inventory, useConsumable, equipItem }) {
  return (
    <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3>Inventario</h3>
        <ConsumablesSection
          inventory={inventory}
          selectedCharacterId={selectedCharacterId}
          useConsumable={useConsumable}
        />
        <EquipablesSection
          inventory={inventory}
          selectedCharacterId={selectedCharacterId}
          allies={allies}
          equipItem={equipItem}
        />
      </div>
    </div>
  );
}