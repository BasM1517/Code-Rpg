//makes sure if your characters will atack
var attack_mode=true;
//is the monster they will seek to kill
var attack_monster_name="snake"
//is the monster they are currently attacking this can be attack_monster_name or the monsterhunt
var attack_monster_name_currently="";
//this will be a array where they can rotate between
var monsters_list = ["goo","bee"];
//the potionvalue of both potions
var potionvalue = 300;
//the leader of the party
var leader = "KleptoKite";
//the merchant
var merchant = "R3dP";
//what they are allowed to hunt on a monsterhuntquest
var monsterhunt_whitelist = ["porcupine","osnake","crab","snake","bee","goo","frog","tortoise","squig","squigtoad"];
//the items the are allowed to carry
var keeplist = ["tracker","mpot0","hpot0"];
//this is the default setting if they are team mode or not
var original_team_mode = false;
//this is the current value
var team_mode = false;
//if monsterhunt is enabled or not
var monsterhunt_mode = true;
//the last date that the potion has been used for cooldowns
last_potion = new Date();
setInterval(function(){
    //is used to send gold
    send_Items_gold();
    //checks if the need is there for a potion
	use_hp_or_mp_own();
	loot();
    //takes care of respawn
    if(character.rip) {respawn(); return;}
	if(!attack_mode || character.rip || is_moving(character)) return;
    handle_monsterhunt();

    if(team_mode == false || character.id == leader){
        var target=get_targeted_monster();
        if(!target)
        {
            target=get_nearest_monster({"type":attack_monster_name_currently});
            if(target){
                change_target(target);
            } 
            else
            {
                set_message("W: " + attack_monster_name_currently);
                smarter_move("main",attack_monster_name_currently)
                return;
            }
        }
    }else{
        //var target=get_target_of(leader);
        if(get_entity(leader)){
            var target =get_target_of(get_player(leader))
            if(!target)
            {
                return move(get_entity(leader).x,get_entity(leader).y);
                //return smart_move({x:get_entity(leader).x, y:get_entity(leader).y, map:get_entity(leader).map});
            }
        }else{
            return send_cm(leader,"2,");
        }
    }
	if(!is_in_range(target))
	{
		move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{
		set_message("A: " + attack_monster_name_currently);
        if(character.ctype == "priest" ){
            leaderentity = get_entity(leader);
            chestakiteentity = get_entity("chestakite");
            if(leaderentity !== undefined){
				if(leaderentity.max_hp - leaderentity.hp >= 500){
                	heal(leaderentity);
				}
            }
			else if(chestakiteentity !== undefined){
				if(chestakiteentity.max_hp - chestakiteentity.hp >= 500){
                	heal(chestakiteentity);
				}
            }
            else if(character.max_hp - character.hp >= 500){
                heal(character);
            }
            if(!is_on_cooldown("curse")){
                use_skill("curse",target);
            }
        }
        if(character.ctype == "ranger" && character.max_mp - character.mp <= 500){
            use_skill("supershot",target);
        }
        if(character.ctype == "warrior" && get_target_of(target) != leader){
            use_skill("taunt",target);
        }
		attack(target);
	}

},1000/4); // Loops every 1/4 seconds.

setInterval(function(){check_for_potions();}, 100000);

//handle potions use
function use_hp_or_mp_own(){
    if(!is_on_cooldown("use_hp")){
        var used = false;
        if(character.max_mp - character.mp >= potionvalue || character.mp <= 50){
            var used = true;
            use_skill('use_mp');
        }else if(character.max_hp - character.hp >= potionvalue)
        {
            var used = true;
            use_skill('use_hp');
        }
    }
}
//check if they have enough potions
function check_for_potions(){
	//character.items.forEach(element => myFunction(element));
    for (let i = 0; i < character.items.length; i++){
        if(myFunction(i) == true){
            break
        }
    }
}
//goes through the inverntory to check if potions are available
function myFunction(item) {
	if(item != null){
		  if(item.q <= 100 && item.name == "mpot0" || item.q <= 100 && item.name == "hpot0" || locate_item_own("hpot0") != 1 || locate_item_own("mpot0") != 1){
            sendlocation("R3dP");
            return true
		  }else{
			  return false;
		  }
	}
}

function on_party_invite(name) // called by the inviter's name
{
    if(name = "R3dP"){
        accept_party_invite(name);
    }
}
//a better movement then the default
function smarter_move(mapN,mobN){
    if(!G.maps[mapN]) {
        // NOTE: If we get here, the map name isn't correct
      }
      
      for(const gMapMonster of G.maps[mapN].monsters) {
        if(gMapMonster.type !== mobN) continue
        const x = (gMapMonster.boundary[0] + gMapMonster.boundary[2]) / 2
        const y = (gMapMonster.boundary[1] + gMapMonster.boundary[3]) / 2
        return smart_move({map: mapN, x: x, y: y})
      }
      return smart_move(attack_monster_name_currently);
}

async function on_cm(name,data)
{
    var ans = data.split(',');
	if(ans[0] == "2"){
        sendlocation(name);
    }

	if(ans[0] == "1"){
		await smart_move({x:ans[1], y:ans[2], map: "main"});
	}
}
//sends the location in a cm
function sendlocation(reciever){
    var x = character.x;
    var y = character.y;
    send_cm(reciever,"1," + x + "," + y);
}
//a prototype for skills
function useskill(skillname,target,archetype){
    if(character.ctype == "warrior");
}
//locates an item is a 0 if false is a 1 if true
function locate_item_own(name)
{
	for(var i=0;i<character.items.length;i++)
	{
		if(character.items[i] && character.items[i].name==name) return 1;
	}
	return -1
}
function handle_monsterhunt() {
    //staep 1 als je geen quest hebt vraag hem aan
    if(monsterhunt_mode == true){
        var monsterhunterloc = {
            x: G.maps.main.npcs[24].position[0],
            y: G.maps.main.npcs[24].position[1],
        };
        if (character.s.monsterhunt) {
            var hunt_type = character.s.monsterhunt.id;
            if (character.s.monsterhunt.c > 0) {
                if (monsterhunt_whitelist.includes(character.s.monsterhunt.id)) {
                    attack_monster_name_currently = hunt_type;
                    if(attack_monster_name == hunt_type){
                        team_mode = true;
                    }else{
                        team_mode = false;
                    }
                }else{
                    attack_monster_name_currently = attack_monster_name;
                    if(original_team_mode == true){
                        team_mode = true;
                    }
                    return  
                }
            }else{
                smart_move(monsterhunterloc);
                return parent.socket.emit("monsterhunt");
            }
        }else{
            team_mode = false;
            set_message("G:Monsterquest");
            smart_move(monsterhunterloc);
            return parent.socket.emit("monsterhunt");
        }
    }
}
//handles transfer of items
function send_Items_gold(){
    if(get_entity("R3dP")){
        if(character.gold != 0 && character.gold >= 5000){
            send_gold(merchant,character.gold);
        }
        for (let i in character.items) {
            let slot = character.items[i];
            if (slot != null) {
                let slot = character.items[i].name;
                if (!keeplist.includes(slot)) {
                    parent.socket.emit("send", { name: "R3dP", num: [i], q: character.items[i].q });
                }
            }
            continue
        }
    }
}
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland