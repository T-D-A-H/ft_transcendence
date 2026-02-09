
pragma solidity ^0.8.28;

contract TournamentScores {
	
	struct Tournament {
		uint256 tournamentId;
		string tournamentName;
		uint256 startTime;
		uint256 endTime;
		bool isFinalized;
		address creator;
	}
	
	struct PlayerScore {
		address playerAddress;
		string playerName;
		uint256 score;
		uint256 timestamp;
		bool isValid;
	}
	
	struct TournamentResult {
		uint256 tournamentId;
		address[] rankedPlayers;
		uint256[] rankedScores;
		uint256 finalizedAt;
	}
	
	address public owner;
	
	uint256 private tournamentCounter;
	
	mapping(uint256 => Tournament) public tournaments;
	mapping(uint256 => mapping(address => PlayerScore)) public tournamentScores;
	mapping(uint256 => address[]) public tournamentPlayers;
	mapping(uint256 => TournamentResult) public tournamentResults;
	
	event TournamentCreated(uint256 indexed tournamentId, string tournamentName, address indexed creator, uint256 timestamp);
	event ScoreRecorded(uint256 indexed tournamentId, address indexed player, string playerName, uint256 score, uint256 timestamp);
	event ScoreUpdated(uint256 indexed tournamentId, address indexed player, uint256 oldScore, uint256 newScore, uint256 timestamp);
	event TournamentFinalized(uint256 indexed tournamentId, uint256 timestamp);
	event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
	
	modifier onlyOwner() {
		require(msg.sender == owner, "Only owner can perform this action");
		_;
	}
	
	modifier tournamentExists(uint256 _tournamentId) {
		require(_tournamentId > 0 && _tournamentId <= tournamentCounter, "Tournament does not exist");
		_;
	}
	
	modifier tournamentNotFinalized(uint256 _tournamentId) {
		require(!tournaments[_tournamentId].isFinalized, "Tournament is already finalized");
		_;
	}
	
	constructor() {
		owner = msg.sender;
		tournamentCounter = 0;
	}
	
	function createTournament(
		string memory _tournamentName,
		uint256 _startTime,
		uint256 _endTime
	) public onlyOwner returns (uint256) {
		require(_startTime < _endTime, "Invalid tournament duration");
		require(bytes(_tournamentName).length > 0, "Tournament name cannot be empty");
		
		tournamentCounter++;
		uint256 newTournamentId = tournamentCounter;
		
		tournaments[newTournamentId] = Tournament({
			tournamentId: newTournamentId,
			tournamentName: _tournamentName,
			startTime: _startTime,
			endTime: _endTime,
			isFinalized: false,
			creator: msg.sender
		});
		
		emit TournamentCreated(newTournamentId, _tournamentName, msg.sender, block.timestamp);
		
		return newTournamentId;
	}
	
	function recordScore(
		uint256 _tournamentId,
		address _playerAddress,
		string memory _playerName,
		uint256 _score
	) public onlyOwner tournamentExists(_tournamentId) tournamentNotFinalized(_tournamentId) {
		require(_playerAddress != address(0), "Invalid player address");
		require(bytes(_playerName).length > 0, "Player name cannot be empty");
		
		Tournament memory tournament = tournaments[_tournamentId];
		require(block.timestamp >= tournament.startTime, "Tournament has not started yet");
		require(block.timestamp <= tournament.endTime, "Tournament has ended");
		
		bool isNewPlayer = !tournamentScores[_tournamentId][_playerAddress].isValid;
		
		if (isNewPlayer) {
			tournamentPlayers[_tournamentId].push(_playerAddress);
			
			tournamentScores[_tournamentId][_playerAddress] = PlayerScore({
				playerAddress: _playerAddress,
				playerName: _playerName,
				score: _score,
				timestamp: block.timestamp,
				isValid: true
			});
			
			emit ScoreRecorded(_tournamentId, _playerAddress, _playerName, _score, block.timestamp);
		} else {
			uint256 oldScore = tournamentScores[_tournamentId][_playerAddress].score;
			tournamentScores[_tournamentId][_playerAddress].score = _score;
			tournamentScores[_tournamentId][_playerAddress].timestamp = block.timestamp;
			
			emit ScoreUpdated(_tournamentId, _playerAddress, oldScore, _score, block.timestamp);
		}
	}
	
	function finalizeTournament(uint256 _tournamentId) 
		public 
		onlyOwner 
		tournamentExists(_tournamentId) 
		tournamentNotFinalized(_tournamentId) 
	{
		tournaments[_tournamentId].isFinalized = true;
		
		address[] memory players = tournamentPlayers[_tournamentId];
		uint256 playerCount = players.length;
		
		address[] memory rankedPlayers = new address[](playerCount);
		uint256[] memory rankedScores = new uint256[](playerCount);
		
		for (uint256 i = 0; i < playerCount; i++) {
			rankedPlayers[i] = players[i];
			rankedScores[i] = tournamentScores[_tournamentId][players[i]].score;
		}
		
		for (uint256 i = 0; i < playerCount; i++) {
			for (uint256 j = i + 1; j < playerCount; j++) {
				if (rankedScores[i] < rankedScores[j]) {
					uint256 tempScore = rankedScores[i];
					rankedScores[i] = rankedScores[j];
					rankedScores[j] = tempScore;
					
					address tempPlayer = rankedPlayers[i];
					rankedPlayers[i] = rankedPlayers[j];
					rankedPlayers[j] = tempPlayer;
				}
			}
		}
		
		tournamentResults[_tournamentId] = TournamentResult({
			tournamentId: _tournamentId,
			rankedPlayers: rankedPlayers,
			rankedScores: rankedScores,
			finalizedAt: block.timestamp
		});
		
		emit TournamentFinalized(_tournamentId, block.timestamp);
	}
	
	function getTournament(uint256 _tournamentId) 
		public 
		view 
		tournamentExists(_tournamentId) 
		returns (Tournament memory) 
	{
		return tournaments[_tournamentId];
	}
	
	function getPlayerScore(uint256 _tournamentId, address _playerAddress) 
		public 
		view 
		tournamentExists(_tournamentId) 
		returns (PlayerScore memory) 
	{
		require(tournamentScores[_tournamentId][_playerAddress].isValid, "Player has no score in this tournament");
		return tournamentScores[_tournamentId][_playerAddress];
	}
	
	function getTournamentPlayers(uint256 _tournamentId) 
		public 
		view 
		tournamentExists(_tournamentId) 
		returns (address[] memory) 
	{
		return tournamentPlayers[_tournamentId];
	}
	
	function getTournamentResults(uint256 _tournamentId) 
		public 
		view 
		tournamentExists(_tournamentId) 
		returns (address[] memory rankedPlayers, uint256[] memory rankedScores, uint256 finalizedAt) 
	{
		require(tournaments[_tournamentId].isFinalized, "Tournament is not finalized yet");
		TournamentResult memory result = tournamentResults[_tournamentId];
		return (result.rankedPlayers, result.rankedScores, result.finalizedAt);
	}
	
	function getTournamentCount() public view returns (uint256) {
		return tournamentCounter;
	}
	
	function transferOwnership(address newOwner) public onlyOwner {
		require(newOwner != address(0), "New owner cannot be zero address");
		address oldOwner = owner;
		owner = newOwner;
		emit OwnershipTransferred(oldOwner, newOwner);
	}
	
	function verifyScoreIntegrity(
		uint256 _tournamentId,
		address _playerAddress,
		uint256 _expectedScore
	) public view tournamentExists(_tournamentId) returns (bool) {
		if (!tournamentScores[_tournamentId][_playerAddress].isValid) {
			return false;
		}
		return tournamentScores[_tournamentId][_playerAddress].score == _expectedScore;
	}
}
