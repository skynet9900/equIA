module.exports = {
    equIA: async (spell, message) => {
        /**
         * An AI for verify and equilibrate spell for Aico discord bot
         * 
         * @param {spell} (object) The spell who need be checked buy the equIA
         * @param {message} () The message on discord that have initialised this AI
         */
        function equiScore(cost, power, successRate, effects, numberOfTargets, typeOfSpell) {
            /**
             * Calculate and return the equiScore of the custom spell
             * 
             * @param {cost} (Number) The cost of the spell (mana or stamina)
             * @param {power} (Number) The number of damage/heal/shield provided
             * @param {successRate} (Number) The success rate of the custom spell in percent
             * @param {effects} (Array) An array with all the effect of the spell
             * @param {numberOfTargets} (Number) The number of targets for the spell
             * @param {typeOfSpell} (String) The type of the spell (damage, shield, heal)
             */
            let maxScore = cost * 2
            let powerScore = 0
            let successRateScore = successRate - 50
            let effectScore = 0
            switch (typeOfSpell) {
                case "shield":
                    effectScore = 0
                    powerScore = power * 1.75
                    break;
                case "heal":
                    if(effects[0] === "revive") effectScore = 600
                    powerScore = power * 1.75
                    break;
                case "dammage":
                    powerScore = power * 1.5
                    for (let index = 0; index < effects.length; index++) {
                        let effect = effects[index]
                        switch (effect) {
                            case "fire":
                                effectScore = effectScore + 90
                                break;
                            case "stun":
                                effectScore = effectScore + 50
                                break;
                            case "blind":
                                effectScore = effectScore + 45
                                break;
                            default:
                                break;
                        }
                    }
                    break;
                default:
                    break;
            }
            let malusScore = powerScore + successRateScore + effectScore
            if(numberOfTargets > 1) malusScore = malusScore * ((numberOfTargets - 1) * 1.75)
            let equiScore = maxScore * 100 / malusScore
            return equiScore
        }
        function equilibrate(spell) {
            /**
             * Equilibrate the spell that have an equiScore less than 75
             * 
             * @param {spell} (object) The spell to equilibrate
             */
            switch (spell.typeOfSpell) {
                case "shield":
                    if(spell.verifications === 0) {
                        spell.verifications = 1
                        spell.cost += 50
                    }
                    else if(spell.verifications === 1) {
                        spell.verifications ++
                        spell.successRate -= 5
                    }
                    else {
                        spell.verifications = 0
                        if(spell.power >= 25) {
                            spell.power -= 25
                        }
                    }
                    break;
                case "heal":
                    if(spell.verifications === 0) {
                        spell.verifications = 1
                        spell.cost += 50
                    }
                    else if(spell.verifications === 1) {
                        spell.verifications ++
                        spell.successRate -= 5
                    }
                    else {
                        spell.verifications = 0
                        if(spell.power >= 25) {
                            spell.power -= 25
                        }
                        else spell.power = 0
                    }
                    break;
                case "damage":
                    switch (spell.verifications) {
                        case 0:
                            spell.verifications ++
                            spell.cost += 50
                            break;
                        case 1:
                            if(effects.length > 0) spell.verifications ++
                            else spell.verifications --
                            if(spell.power > 25) {
                                spell.power -= 25
                            } 
                            else spell.power = 0
                            break;
                        case 2:
                            spell.successRate -= 5
                            spell.verifications ++
                            break;
                        case 3:
                            let randomDelete = Math.floor(Math.random() * (spell.effects.length + 1))
                            spell.effects.splice(randomDelete, 1)
                            spell.verifications = 0
                            break;
                        
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            if(spell.successRate <= 0) spell.successRate = 1
            let newScore = await equiScore(spell.cost, spell.power, spell.successRate, spell.effects, spell.numberOfTargets, spell.typeOfSpell)
            if(newScore >= 75) return newScore
            else {
                equilibrate(spell)
            }
        }
        if(typeof spell !== "object") throw new Error("equIA error: type of `spell` isn't an object")
        if(spell.typeOfSpell === "other") throw new Error("equIA error: the type of the custom spell can't be `other`")
        let originalScore = await equiScore(spell.cost, spell.power, spell.successRate, spell.effects, spell.numberOfTargets, spell.typeOfSpell)
        spell.equiScore = originalScore
        if(originalScore >= 75) return [spell, originalScore]
        else {
            return equilibrate(spell)
        }
    }
}