
function createTestUsers(userManager, count)
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

		const tournament = userManager.createTournament(user, display_name, size);
		if (size % 3 === 0) {
			tournament.setTESTING();
			tournament.currentPlayerCount = size;
			tournament.setReady();
		}
		size += 2;
	}
}

module.exports = {createTestUsers};