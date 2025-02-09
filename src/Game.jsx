import React, { useState, useEffect } from "react";
import "./Game.css";

// Import images
import polloImg from "./pollo.png";
import bootsImg from "./boots.png";
import varitaImg from "./varita.png";
import espadaImg from "./espada.png";
import picoImg from "./pico.png";
import anilloImg from "./anillo.png";
import libroImg from "./libro.png";
import gemaImg from "./gema.png";
import capaImg from "./capa.png";
import hatImg from "./sombrero.png";
import cascoImg from "./Casco.png";
import armorImg from "./armor.png";
import legsImg from "./legs.png";
import potionImg from "./potion.png";
import coinImg from "./coin.png";
import characterImg from './character.png';
import shieldImg from "./Shield.png";
import foodIcon from './food.png';
import ironIcon from './iron.png';
import mudIcon from './mud.png';
import woodIcon from './wood.png';
import casaIcon from './casa.png';

const Game = () => {
  const [character, setCharacter] = useState({
    hp: 100,
    maxHp: 100,
    stamina: 10,
    strength: 10,
    agility: 10,
    intelligence: 10,
    luck: 10,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    goldCoins: 0,
    statPoints: 0,
    inventory: [],
    equipment: {
      helmet: null,
      armor: null,
      legs: null,
      boots: null,
      leftHand: null,
      rightHand: null,
    },
  });

  const [missionResult, setMissionResult] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [easyMissionCooldown, setEasyMissionCooldown] = useState(0);
  const [hardMissionCooldown, setHardMissionCooldown] = useState(0);
  
  const [resources, setResources] = useState({
    wood: 0,
    iron: 0,
    food: 0,
    mud: 0,
  });
  
  const [increments, setIncrements] = useState({
    wood: 1,
    iron: 1,
    food: 1,
    mud: 1,
  });

  const [incrementCosts, setIncrementCosts] = useState({
    wood: 10,
    iron: 10,
    food: 10,
    mud: 10,
  });

  const [houseLevel, setHouseLevel] = useState(1);
  const [resourceCost, setResourceCost] = useState(10);

  const targetDate = new Date("2025-02-09T10:00:00");
  const [secondsElapsed, setSecondsElapsed] = useState(() => {
    return Math.floor((Date.now() - targetDate) / 1000);
  });

  const saveGame = () => {
    const gameData = {
      character,
      missionResult,
      easyMissionCooldown,
      hardMissionCooldown,
      resources,
      increments,
      incrementCosts,
      houseLevel,
      resourceCost,
      lastSaved: Date.now(),
    };
    localStorage.setItem("gameData", JSON.stringify(gameData));
    setLastSaved(Date.now());
  };

  const loadGame = () => {
    const savedData = JSON.parse(localStorage.getItem("gameData"));
    if (savedData) {
      const currentTime = Date.now();
      const timeOffline = (currentTime - savedData.lastSaved) / 1000;
      let offlineResources = {};
      for (const resource in savedData.resources) {
          offlineResources[resource] = timeOffline * savedData.increments[resource];
      }

      setResources((prevResources) => {
          const updatedResources = { ...prevResources };
          for (const resource in offlineResources) {
              updatedResources[resource] = parseFloat((savedData.resources[resource] + offlineResources[resource]).toFixed(2)); 
          }
          return updatedResources;
      });



      setCharacter(savedData.character);
      setMissionResult(savedData.missionResult);
      setEasyMissionCooldown(savedData.easyCooldown);
      setHardMissionCooldown(savedData.hardMissionCooldown);
      setIncrements(savedData.increments);
      setIncrementCosts(savedData.incrementCosts);
      setHouseLevel(savedData.houseLevel);
      setResourceCost(savedData.resourceCost);
      setSecondsElapsed(savedData.secondsElapsed);
      
    }
  };



  useEffect(() => {
    const intervals = {};
    for (const resource in resources) {
      intervals[resource] = setInterval(() => {
        setResources((prevResources) => ({
          ...prevResources,
          [resource]: prevResources[resource] + increments[resource],
        }));
      }, 1000);
    }

    return () => {
      for (const resource in intervals) {
        clearInterval(intervals[resource]);
      }
    };
  }, [increments]);

  const increaseIncrement = (resource) => {
    if (
      resources.wood >= incrementCosts[resource] &&
      resources.iron >= incrementCosts[resource] &&
      resources.food >= incrementCosts[resource] &&
      resources.mud >= incrementCosts[resource]
    ) {
      setResources((prevResources) => ({
        ...prevResources,
        wood: prevResources.wood - incrementCosts[resource],
        iron: prevResources.iron - incrementCosts[resource],
        food: prevResources.food - incrementCosts[resource],
        mud: prevResources.mud - incrementCosts[resource],
      }));

      setIncrements((prevIncrements) => ({
        ...prevIncrements,
        [resource]: prevIncrements[resource] * 1.2,
      }));

      setIncrementCosts((prevCosts) => ({
        ...prevCosts,
        [resource]: prevCosts[resource] * 1.2,
      }));
    } else {
      alert(`Not enough resources to increase speed for ${resource}!`);
    }
  };

  const levelUpHouse = () => {
    if (
      resources.wood >= resourceCost &&
      resources.iron >= resourceCost &&
      resources.food >= resourceCost &&
      resources.mud >= resourceCost
    ) {
      setResources({
        wood: resources.wood - resourceCost,
        iron: resources.iron - resourceCost,
        food: resources.food - resourceCost,
        mud: resources.mud - resourceCost,
      });
      setHouseLevel(houseLevel + 1);
      setResourceCost(resourceCost * 1.2);
    } else {
      alert('Not enough resources to level up the house!');
    }
  };

  const calculateBonusHp = (equipment) => {
    const hpItems = ["Armor", "Helmet", "Boots", "Shield", "Capa", "Hat", "Legs"];
    let bonusHp = 0;

    for (const item of Object.values(equipment)) {
      if (hpItems.includes(item)) {
        bonusHp += 20;
      }
    }

    return bonusHp;
  };

  // Heal character over time
  useEffect(() => {
    const healInterval = setInterval(() => {
      setCharacter((prev) => ({
        ...prev,
        hp: Math.min(prev.hp + 10, prev.maxHp),
      }));
    }, 10000);

    return () => clearInterval(healInterval);
  }, []);

  // Easy mission cooldown
  useEffect(() => {
    const easyCooldownInterval = setInterval(() => {
      if (easyMissionCooldown > 0) {
        setEasyMissionCooldown((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(easyCooldownInterval);
  }, [easyMissionCooldown]);

  // Hard mission cooldown
  useEffect(() => {
    const hardCooldownInterval = setInterval(() => {
      if (hardMissionCooldown > 0) {
        setHardMissionCooldown((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(hardCooldownInterval);
  }, [hardMissionCooldown]);

  // Gain experience and level up
  const gainExp = (exp) => {
    let newExp = character.exp + exp;
    let newLevel = character.level;
    let newNextLevelExp = character.nextLevelExp;

    while (newExp >= newNextLevelExp) {
      newExp -= newNextLevelExp;
      newLevel++;
      newNextLevelExp = Math.floor(newNextLevelExp * 1.2);
      setCharacter((prev) => ({
        ...prev,
        statPoints: prev.statPoints + 5,
      }));
    }

    setCharacter((prev) => ({
      ...prev,
      exp: newExp,
      level: newLevel,
      nextLevelExp: newNextLevelExp,
    }));
  };

  // Go on an easy mission
  const goOnMission = () => {
    if (easyMissionCooldown > 0) return;

    setEasyMissionCooldown(5); // 5-second cooldown
    setMissionResult("Your character is on a mission...");

    setTimeout(() => {
      const isSuccess = Math.random() < 0.7; // 70% chance of success

      if (isSuccess) {
        const reward = Math.random();
        let newItem = "";
        if (reward < 0.1) newItem = "Gem";
        else if (reward < 0.2) newItem = "Sword";
        else if (reward < 0.3) newItem = "Shield";
        else if (reward < 0.4) newItem = "Helmet";
        else if (reward < 0.5) newItem = "Armor";
        else if (reward < 0.6) newItem = "Legs";
        else if (reward < 0.7) newItem = "Boots";
        else if (reward < 0.8) newItem = "Wand";
        else if (reward < 0.9) newItem = "Ring";
        else newItem = "Book";

        setCharacter((prev) => ({
          ...prev,
          goldCoins: prev.goldCoins + 10,
          inventory: newItem !== "Nothing" ? [...prev.inventory, newItem] : prev.inventory,
        }));

        gainExp(50);
        setMissionResult(`Mission Success! You gained 10 gold coins and ${newItem}.`);
      } else {
        setCharacter((prev) => ({
          ...prev,
          hp: Math.max(prev.hp - 30, 0),
        }));
        setMissionResult("Mission Failed! You lost 30 HP.");
      }
    }, 5000); // Delay execution by 5 seconds
  };

  // Go on a hard mission
  const goOnHardMission = () => {
    if (hardMissionCooldown > 0) return;

    setHardMissionCooldown(20); // 20-second cooldown
    setMissionResult("Your character is on a hard mission...");

    setTimeout(() => {
      const isSuccess = Math.random() < 0.3; // 30% chance of success

      if (isSuccess) {
        const reward = Math.random();
        let newItem = "";
        if (reward < 0.2) newItem = "Armor";
        else if (reward < 0.3) newItem = "Helmet";
        else if (reward < 0.4) newItem = "Legs";
        else if (reward < 0.7) newItem = "Hat";
        else if (reward < 0.8) newItem = "Boots";
        else newItem = "Gem";

        setCharacter((prev) => ({
          ...prev,
          goldCoins: prev.goldCoins + 20,
          inventory: newItem !== "Nothing" ? [...prev.inventory, newItem] : prev.inventory,
        }));

        gainExp(100);
        setMissionResult(`Hard Mission Success! You gained 20 gold coins and ${newItem}.`);
      } else {
        setCharacter((prev) => ({
          ...prev,
          hp: Math.max(prev.hp - 60, 0),
        }));
        setMissionResult("Hard Mission Failed! You lost 60 HP.");
      }
    }, 20000); // Delay execution by 20 seconds
  };

  // Use an item (e.g., Potion)
  const useItem = (item) => {
    if (item === "Potion") {
      setCharacter((prev) => ({
        ...prev,
        hp: Math.min(prev.hp + 25, prev.maxHp),
      }));
      setCharacter((prev) => ({
        ...prev,
        inventory: prev.inventory.filter((i, index) => index !== prev.inventory.indexOf(item)),
      }));
    }
  };

  // Equip an item
  const equipItem = (item, slot) => {
    if (isValidSlot(item, slot)) {
      setCharacter((prev) => {
        const newEquipment = { ...prev.equipment, [slot]: item };
        const bonusHp = calculateBonusHp(newEquipment);
        const newMaxHp = 100 + bonusHp;

        return {
          ...prev,
          equipment: newEquipment,
          inventory: prev.inventory.filter((i, index) => index !== prev.inventory.indexOf(item)),
          maxHp: newMaxHp,
          hp: Math.min(prev.hp, newMaxHp),
        };
      });
    }
  };

  // Unequip an item
  const unequipItem = (slot) => {
    const item = character.equipment[slot];
    if (item) {
      setCharacter((prev) => {
        const newEquipment = { ...prev.equipment, [slot]: null };
        const bonusHp = calculateBonusHp(newEquipment);
        const newMaxHp = 100 + bonusHp;

        return {
          ...prev,
          equipment: newEquipment,
          inventory: [...prev.inventory, item],
          maxHp: newMaxHp,
          hp: Math.min(prev.hp, newMaxHp),
        };
      });
    }
  };

  // Check if an item can be equipped in a slot
  const isValidSlot = (item, slot) => {
    const validSlots = {
      Helmet: ["helmet"],
      Armor: ["armor"],
      Legs: ["legs"],
      Boots: ["boots"],
      Sword: ["leftHand", "rightHand"],
      Shield: ["leftHand", "rightHand"],
      Wand: ["leftHand", "rightHand"],
      Ring: ["leftHand", "rightHand"],
      Book: ["leftHand", "rightHand"],
      Capa: ["armor"],
      Hat: ["helmet"],
    };

    return validSlots[item]?.includes(slot);
  };

  // Drag-and-drop functionality
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
  };

  const handleDrop = (e, slot) => {
    e.preventDefault();

    if (draggedItem && isValidSlot(draggedItem, slot)) {
      const currentSlot = Object.keys(character.equipment).find(
        (key) => character.equipment[key] === draggedItem
      );

      const itemInTargetSlot = character.equipment[slot]; // Ítem que ya está en el slot objetivo

      if (currentSlot) {
        unequipItem(currentSlot); // Remueve el ítem arrastrado de su slot original
      }

      equipItem(draggedItem, slot); // Mueve el ítem arrastrado al nuevo slot

      if (itemInTargetSlot) {
        // Si hay un ítem en el slot de destino, lo mueve al slot original
        equipItem(itemInTargetSlot, currentSlot);
      }

      setDraggedItem(null);
    }
  };


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Get the image for an item
  const getItemImage = (item) => {
    switch (item) {
      case "Potion":
        return potionImg;
      case "Sword":
        return espadaImg;
      case "Shield":
        return shieldImg;
      case "Helmet":
        return cascoImg;
      case "Armor":
        return armorImg;
      case "Legs":
        return legsImg;
      case "Boots":
        return bootsImg;
      case "Wand":
        return varitaImg;
      case "Ring":
        return anilloImg;
      case "Book":
        return libroImg;
      case "Gem":
        return gemaImg;
      case "Hat":
        return hatImg;
      case "Capa":
        return capaImg;
      default:
        return null;
    }
  };

  const spendStatPoint = (stat) => {
    if (character.statPoints > 0 && character[stat] < 30 && stat == "stamina") {
      setCharacter((prev) => ({
        ...prev,
        [stat]: prev[stat] + 1,
        statPoints: prev.statPoints - 1,
        maxHp: prev.maxHp + 5,
      }));
    }
    else if (character.statPoints > 0 && character[stat] < 30) {
      setCharacter((prev) => ({
        ...prev,
        [stat]: prev[stat] + 1,
        statPoints: prev.statPoints - 1,
      }));
    }

  };

  return (
    <div className="game-container">
      <div className="main-content">
        <div className="resource-game-container">
          <div className="resource-section">
            <h1>Resource Management</h1>
            <div>
              {Object.entries(resources).map(([resource, count]) => (
                <div key={resource} className="resource-item">
                  <div className="resource-info">
                    <img
                      src={
                        resource === 'food' ? foodIcon :
                          resource === 'iron' ? ironIcon :
                            resource === 'mud' ? mudIcon :
                              resource === 'wood' ? woodIcon : null
                      }
                      alt={resource}
                      className="resource-icon"
                    />
                    <div className="resource-text">
                      <h3>{resource}</h3>
                      <p>{count.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => increaseIncrement(resource)}
                    className="increment-button"
                  >
                    Increase Increment by 20% (Cost: {incrementCosts[resource].toFixed(2)} of each)
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="house-section">
            <div>
              <h3>House Level: {houseLevel}</h3>
              <p>Cost to Level Up: {resourceCost.toFixed(2)} of each resource</p>
              <button onClick={levelUpHouse} className="level-up-button">
                Level Up House
              </button>
            </div>
            <img
              src={casaIcon}
              alt="House"
              className="house-icon"
            />
          </div>
          <div className="save-load-buttons">
                <button className="save-button" onClick={saveGame}>Save Game</button>
                <button className="load-button" onClick={loadGame}>Load Game</button>
            </div>
        </div>
        <div className="left-panel">
          <div className="character-section">
            <div className="stats">
              <div className="avatar">
              <div>
              <h1>Character</h1>
              <h2>Stats</h2>
              <p>Level: {character.level}</p>
              </div>
              <img src={characterImg} alt="Character" className="character-image" />
              </div>
              <div className="stat-row">
                <p>HP: {character.hp} / {character.maxHp}</p>
                <div className="bar hp-bar">
                  <div style={{ width: `${(character.hp / character.maxHp) * 100}%` }}></div>
                </div>
              </div>
              <div className="stat-row">
                <p>XP: {character.exp} / {character.nextLevelExp}</p>
                <div className="bar xp-bar">
                  <div style={{ width: `${(character.exp / character.nextLevelExp) * 100}%` }}></div>
                </div>
              </div>
              <div className="stat-row">
                <p>Stamina: {character.stamina}</p>
                <div className="bar stat-bar">
                  <div style={{ width: `${(character.stamina / 30) * 100}%` }}></div>
                </div>
                <button className="stat-button" onClick={() => spendStatPoint("stamina")}>+</button>
              </div>
              <div className="stat-row">
                <p>Strength: {character.strength}</p>
                <div className="bar stat-bar">
                  <div style={{ width: `${(character.strength / 30) * 100}%` }}></div>
                </div>
                <button className="stat-button" onClick={() => spendStatPoint("strength")}>+</button>
              </div>
              <div className="stat-row">
                <p>Agility: {character.agility}</p>
                <div className="bar stat-bar">
                  <div style={{ width: `${(character.agility / 30) * 100}%` }}></div>
                </div>
                <button className="stat-button" onClick={() => spendStatPoint("agility")}>+</button>
              </div>
              <div className="stat-row">
                <p>Intelligence: {character.intelligence}</p>
                <div className="bar stat-bar">
                  <div style={{ width: `${(character.intelligence / 30) * 100}%` }}></div>
                </div>
                <button className="stat-button" onClick={() => spendStatPoint("intelligence")}>+</button>
              </div>
              <div className="stat-row">
                <p>Luck: {character.luck}</p>
                <div className="bar stat-bar">
                  <div style={{ width: `${(character.luck / 30) * 100}%` }}></div>
                </div>
                <button className="stat-button" onClick={() => spendStatPoint("luck")}>+</button>
              </div>
              <p>Gold Coins: {character.goldCoins}</p>
              <p>Stat Points: {character.statPoints}</p>
            </div>
          </div>
          <div className="missions-section">
            <h2>Missions</h2>
            <button onClick={goOnMission} disabled={easyMissionCooldown > 0}>
              Go on Mission {easyMissionCooldown > 0 ? `(${easyMissionCooldown}s)` : ""}
            </button>
            <button onClick={goOnHardMission} disabled={hardMissionCooldown > 0}>
              Go on Hard Mission {hardMissionCooldown > 0 ? `(${hardMissionCooldown}s)` : ""}
            </button>
            <p>{missionResult}</p>
          </div>
        </div>
        <div className="right-panel">
          <div className="equipment-section">
            <h2>Equipment</h2>
            <div className="equipment-grid">
              <div className="equipment-slot helmet" onDrop={(e) => handleDrop(e, "helmet")} onDragOver={handleDragOver}>
                {character.equipment.helmet ? (
                  <img
                    src={getItemImage(character.equipment.helmet)}
                    alt={character.equipment.helmet}
                    draggable
                    onDragStart={(e) => handleDragStart(e, character.equipment.helmet)}
                    onClick={() => unequipItem("helmet")}
                  />
                ) : (
                  <span>Helmet</span>
                )}
              </div>
              <div className="equipment-slot left-hand" onDrop={(e) => handleDrop(e, "leftHand")} onDragOver={handleDragOver}>
                {character.equipment.leftHand ? (
                  <img
                    src={getItemImage(character.equipment.leftHand)}
                    alt={character.equipment.leftHand}
                    draggable
                    onDragStart={(e) => handleDragStart(e, character.equipment.leftHand)}
                    onClick={() => unequipItem("leftHand")}
                  />
                ) : (
                  <span>Left Hand</span>
                )}
              </div>
              <div className="equipment-slot armor" onDrop={(e) => handleDrop(e, "armor")} onDragOver={handleDragOver}>
                {character.equipment.armor ? (
                  <img
                    src={getItemImage(character.equipment.armor)}
                    alt={character.equipment.armor}
                    draggable
                    onDragStart={(e) => handleDragStart(e, character.equipment.armor)}
                    onClick={() => unequipItem("armor")}
                  />
                ) : (
                  <span>Armor</span>
                )}
              </div>
              <div className="equipment-slot right-hand" onDrop={(e) => handleDrop(e, "rightHand")} onDragOver={handleDragOver}>
                {character.equipment.rightHand ? (
                  <img
                    src={getItemImage(character.equipment.rightHand)}
                    alt={character.equipment.rightHand}
                    draggable
                    onDragStart={(e) => handleDragStart(e, character.equipment.rightHand)}
                    onClick={() => unequipItem("rightHand")}
                  />
                ) : (
                  <span>Right Hand</span>
                )}
              </div>
              <div className="equipment-slot legs" onDrop={(e) => handleDrop(e, "legs")} onDragOver={handleDragOver}>
                {character.equipment.legs ? (
                  <img
                    src={getItemImage(character.equipment.legs)}
                    alt={character.equipment.legs}
                    draggable
                    onDragStart={(e) => handleDragStart(e, character.equipment.legs)}
                    onClick={() => unequipItem("legs")}
                  />
                ) : (
                  <span>Legs</span>
                )}
              </div>
              <div className="equipment-slot boots" onDrop={(e) => handleDrop(e, "boots")} onDragOver={handleDragOver}>
                {character.equipment.boots ? (
                  <img
                    src={getItemImage(character.equipment.boots)}
                    alt={character.equipment.boots}
                    draggable
                    onDragStart={(e) => handleDragStart(e, character.equipment.boots)}
                    onClick={() => unequipItem("boots")}
                  />
                ) : (
                  <span>Boots</span>
                )}
              </div>
            </div>
          </div>
          <div className="inventory-section">
            <h2>Inventory (8x4)</h2>
            <div className="inventory-grid">
              {Array.from({ length: 20 }).map((_, index) => (
                <div key={index} className="inventory-slot">
                  {character.inventory[index] && (
                    <img
                      src={getItemImage(character.inventory[index])}
                      alt={character.inventory[index]}
                      draggable
                      onDragStart={(e) => handleDragStart(e, character.inventory[index])}
                      onClick={() => useItem(character.inventory[index])}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;