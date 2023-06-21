// Hey there!
// This is CODE, lets you control your character with code.
// If you don't know how to code, don't worry, It's easy.
// Just set attack_mode to true and ENGAGE!
var attack_monster = "goo";
var potion_data = ["mpot0", "hpot0", 300];
var farmersgoldkeep = 12000;
var bool_walk_circle = false;
var character_list = ["R3dP", "Rockey", "Unakite", "Larvikite"];
var monsterhunt_whitelist = [
    "goo",
    "crab",
    "bee",
    "spider",
    "armadillo",
    "croc",
    "rooster",
    "frog",
    "snake",
    "osnake",
    "squig",
    "poisio",
    "tortoise",
];

var farmerskeep = ["mpot0", "hpot0", "tracker"];
var sell_whitelist = [
    "wshoes",
    "ringsj",
    "wcap",
    "hpamulet",
    "hpbelt",
    "slimestaff",
    "shoes",
    "gloves",
    "staff",
];
if (character.ctype == "merchant") {
    initiate_code();
}
setInterval(function () {
    handle_party();
    //buy_potions();
    if (character.ctype != "merchant") {
        attack_monsters_with_master();
        give_items_to_merchant();
        loot();
    }

    handle_respawn();
    handle_health();
}, 1000 / 4); // Loops every 1/4 seconds.

//de loop voor de merchant
setInterval(function () {
    if (
        character.s.monsterhunt &&
        monsterhunt_whitelist.includes(character.s.monsterhunt)
    ) {
        count = character.s.monsterhunt.c;
        delay(20000);
        if ((count = character.s.monsterhunt.c)) {
            use_skill("town");
        }
    }
}, 30000);

setInterval(function () {
    if (character.ctype == "merchant") {
        sell();
    }
}, 300000);

async function attack_monsters() {
    var target = get_targeted_monster();
    if (!target) {
        target = get_nearest_monster({ no_target: true, type: attack_monster });
        if (target) {
            change_target(target);
        } else {
            if (!smart.moving) {
                bool_walk_circle = false;
                set_message("No Monsters");
                smart_move(attack_monster);
                return;
            }
        }
    }
    if (!is_in_range(target)) {
        if (!is_moving(character)) {
            move(
                character.x + (target.x - character.x) / 2,
                character.y + (target.y - character.y) / 2
            );
        }
        // Walk half the distance
    } else if (can_attack(target)) {
        set_message("Attacking");
        attack(target);
        bool_walk_circle = true;
        secondFunction();
    }
}

var last_respawn = null;

function handle_respawn() {
    if (character.rip) {
        console.log(last_respawn);
        if (new Date() - last_respawn <= 20000) {
            respawn();
            last_respawn = null;
        } else {
            last_respawn = new Date();
        }
        return;
    }
}
//voeg een functie toe zodat als de mana lager is dan .... dan eerst de mpot
function handle_health() {
    if (is_on_cooldown("use_hp")) return;
    if (
        character.max_hp - character.hp >= potion_data[2] &&
        character.mp >= 100
    ) {
        use_skill("use_hp");
        return;
    } else {
        if (character.max_mp - character.mp >= potion_data[2]) {
            use_skill("use_mp");
            return;
        }
    }
}
function buy_potions() {
    if (item_quantity(potion_data[0]) < 5 || item_quantity(potion_data[1]) < 5)
        if (!smart.moving) {
            smart_move({ to: "potions" }, function (done) {
                if (item_quantity(potion_data[1]) < potion_data[2]) {
                    buy(potion_data[1], potion_data[2]);
                }
                if (item_quantity(potion_data[0]) < potion_data[2]) {
                    buy(potion_data[0], potion_data[2]);
                }
                game_log("Got the potions!", "#4CE0CC");
                return;
            });
        }
}
function item_quantity(name) {
    for (var i = 0; i < 42; i++) {
        if (character.items[i] && character.items[i].name == name)
            return character.items[i].q || 0;
    }
    return 0;
}
function initiate_code() {
    if ((character.ctype = "merchant")) {
        parent.start_character_runner("Unakite", "master");
        parent.start_character_runner("Rockey", "master");
        parent.start_character_runner("Larvikite", "master");
    }
}
function handle_party() {
    if (
        !character.party ||
        Object.keys(parent.party).length < character_list.length
    ) {
        if (character.name == character_list[0]) {
            for (let i in character_list) {
                player = character_list[i];
                if (!Object.keys(parent.party).includes(player)) {
                    send_party_invite(player);
                }
            }
        } else {
            accept_party_invite("R3dP");
        }
    }
}

function give_items_to_merchant() {
    let merchant = get_player(character_list[0]);
    if (merchant != null && character.gold > farmersgoldkeep + 5000) {
        gold_to_send = character.gold - farmersgoldkeep;
        parent.socket.emit("send", { name: "R3dP", gold: gold_to_send });
    }
    if (merchant != null) {
        for (let i in character.items) {
            let slot = character.items[i];
            if (slot != null) {
                let slot = character.items[i].name;
                if (!farmerskeep.includes(slot)) {
                    parent.socket.emit("send", { name: "R3dP", num: [i], q: 999 || 1 });
                }
            }
        }
    }
}
function Walk_to_party_members() {
    //for(let i in character_list.length){
    buy_potions();
    destinationx = parent.party["Rockey"].x;
    destinationy = parent.party["Rockey"].y;
    set_message("travelling");
    if (!smart.moving) {
        smart_move(destinationx, destinationy);
        for (let i in character_list) {
            if (character_list[i] != "R3dP") {
                parent.socket.emit("send", {
                    name: character_list[i],
                    num: character.items[1].name,
                    q: 100,
                });
                parent.socket.emit("send", {
                    name: character_list[i],
                    num: character.items[0].name,
                    q: 100,
                });
            }
        }
    }
}
function sell(num, quantity) {
    //sell an item from character.items by it's order - 0 to N-1
    ranger = get_player(character_list[1]);
    if (ranger != null) {
        if (!smart.moving) {
            smart_move({ to: "potions" }, function (sell) {
                for (let i in character.items) {
                    let slot = character.items[i];
                    if (slot != null) {
                        let slot = character.items[i].name;
                        if (sell_whitelist.includes(slot)) {
                            parent.sell([i], character.items[i].q);
                        }
                    }
                }
                return;
            });
        }
    } else {
        if (!smart.moving) {
            smart_move(attack_monster, function () {
                sell();
            });
        }
    }
}

function handle_monsterhunt() {
    //staep 1 als je geen quest hebt vraag hem aan
    var monsterhunterloc = {
        x: parent.G.maps.main.npcs[24].position[0],
        y: parent.G.maps.main.npcs[24].position[1],
    };
    if (character.s.monsterhunt) {
        var hunt_type = character.s.monsterhunt.id;
        if (character.s.monsterhunt.c > 0) {
            if (monsterhunt_whitelist.includes(character.s.monsterhunt.id)) {
                nearest = get_nearest_monster({ no_target: true, type: hunt_type });
                var target = get_targeted_monster();
                if (!target) { 
                    if (nearest) {
                        change_target(nearest);
                    } else {
                        if (!smart.moving) {
                            smart_move(hunt_type);
                        }
                    }
                } else {
                    attack_monsters_with_master();
                }
            } else {
                attack_monsters_with_master();
            }
        } else {
            var transporterloc = { x: -60, y: -220 };
            if (character.map == "halloween") {
                if (!smart.moving) {
                    smart_move("hen");
                }
            } else {
                if (!smart.moving) {
                    //als er een quest is en je hebt hem klaar lever hem in
                    smart_move(monsterhunterloc);
                    parent.socket.emit("monsterhunt");
                    return;
                }
            }
        }
    } else {
        if (character.map == "halloween") {
            if (!smart.moving && character.position != { x: -60, y: -300 }) {
                smart_move("hen");
            }
        } else {
            if (!smart.moving) {
                //als je nog geen quest hebt vraag hem aan
                smart_move(monsterhunterloc);
                parent.socket.emit("monsterhunt");
            }
        }
    }
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function walk_circle() {
    if (character.ctype == "ranger") {
        var characterx = character.x;
        var charactery = character.y;
        await move(character.x + 50, 50 + character.y);
        await move(character.x + -50, 50 + character.y);
        await move(character.x + -50, -50 + character.y);
        await move(character.x + 50, -50 + character.y);
        return;
    }
}
const secondFunction = async () => {
    //await walk_circle();
};

async function attack_monsters_with_master() {
    // volg de master met een afstand van 100
    // krijg de target van de master
    // val de target aan


    console.log("hey");
    if (character.name == character_list[3]) {
        console.log("daar")
        var target = get_targeted_monster();
        if (!target && character_list[3]) {
            target = get_nearest_monster({ no_target: true, type: attack_monster });
            if (target) {
                change_target(target);
            } else {
                if (!smart.moving) {
                    bool_walk_circle = false;
                    set_message("No Monsters");
                    smart_move(attack_monster);
                    return;
                }
            }
        }
    }else{
        console.log("hoe gaat t")
        let player = get_player("Larvikite")
        console.log(player.id);
        target = player.target;
        console.log(target)
        if(!target){
            if(!smart.moving){
                smart_move(player.x + 50, player.y);
                set_message("Aan het lopen naar Larvikite");
                return;
            }
        }else{
            console.log("HELO")
            change_target(target);
        }
    }
    if (!is_in_range(target)) {
        if (!is_moving(character)) {
            // move(
            //     character.x + (target.x - character.x) / 2,
            //     character.y + (target.y - character.y) / 2
            // );
        }
        // Walk half the distance
    } else if (can_attack(target)) {
        set_message("Attacking");
        attack(target);
    }
}
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland
