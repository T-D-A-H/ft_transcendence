module.exports = function createTestUsers(userManager, count)
{

	let size = 2;
	const TEST_NAMES = [
	"AGuyOnTheCouch",
	"Robertzo420",
	"WiFightClub",
	"DonutDestroyer",
	"MyBadBro",
	"ObiWanCannoli",
	"LordOfTheFlies",
	"AverageLavigne",
	"MrTakfgul",
	"jai345san",
	"fcurban",
	"mgrincho",
	"irganoo",
	"beltomato",
	"YeetTheRich",
	"PanicAtTheMenu",
	"OprahWindfury",
	"CTRLAltDefeat",
	"Fedora_The_Explorer",
	"CheesyToe"
	];
	let users = [];
	for (let i = 0; i < count; i++)
	{
		const user_id = userManager.createId();
		const name = TEST_NAMES[i % TEST_NAMES.length];

		const user_name = name;
		const display_name = name;
		const user_socket = null; 

		const user = userManager.createUser(user_id, user_name, display_name, user_socket);

		userManager.addUser(user);
		userManager.loginUser(user_id);
		users.push(user);
		
		size += 2;
	}
	return users;
}