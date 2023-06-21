var partylist = ["TacoKite","chestakite","KleptoKite"];
var sell_list = ["helmet","coat","pants","shoes"];
var potionvalue = 300;

async function initiate_code() {
        partylist.forEach(element => {
            parent.start_character_runner(element, "FightercodeV2");
        });
        await delay(30000);
	    partylist.forEach(element => {
            send_party_invite(element);
        });

}
setInterval(function(){use_hp_or_mp_own();}, 1000);

function use_hp_or_mp_own(){
    if(!is_on_cooldown("use_hp")){
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

function buy_with_gold(name,quantity)
{
	return parent.buy_with_gold(name,quantity); // returns a Promise
}

async function on_cm(name,data)
{
	var ans = data.split(',');
	if(ans[0] == "1"){
		await smart_move("town");
		buy_with_gold("hpot0",200);
		buy_with_gold("mpot0",200);
		await smart_move({x:ans[1], y:ans[2], map: "main"});
		parent.socket.emit("send", { name: name, num: [0], q: 200});
		parent.socket.emit("send", { name: name, num: [1], q: 200});
        await smart_move("town");
        sell_stuff();
	}
}
function locate_item_own(name)
{
	for(var i=0;i<character.items.length;i++)
	{
		if(character.items[i] && character.items[i].name==name) return i;
	}
	console.log("-1")
}
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland

function buy_with_gold(name,quantity)
{
	return parent.buy_with_gold(name,quantity); // returns a Promise
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
function sell_stuff(){
    for (let i in character.items) {
        let slot = character.items[i];
        if (slot != null) {
            let slot = character.items[i].name;
            if (sell_list.includes(slot)) {
                sell([i],character.items[1].q)
            }
        }
    }
}
initiate_code()
// Learn Javascript: https://www.codecademy.com/learn/introduction-to-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland