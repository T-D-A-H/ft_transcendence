module.exports = function userInfo(targetUser) {

    const s = targetUser.stats;
    let winRate_temp = s.matches > 0 ? (s.total_wins / s.matches) * 100 : 0;
    if (!Number.isFinite(winRate_temp))
        winRate_temp = "0%";
    else
        winRate_temp = `${Math.round(winRate_temp)}%`;
    
    s.win_rate = winRate_temp;
    return {
        status: 200, 
        msg: "Succesfully fetched user info.", 
        target: {
            display_name: targetUser.getDisplayName(),
            username: targetUser.getUsername(),
            user_id: targetUser.getId(),
            avatar: targetUser.getAvatar(),
            stats: {
                local_played: s.local_played,
                local_won: s.local_won,
                online_played: s.online_played,
                online_won: s.online_won,
                tournaments_played: s.tournaments_played,
                tournaments_won: s.tournaments_won,
                ai_played: s.ai_played,
                ai_won: s.ai_won,
                totalGames: s.matches, 
                totalWins: s.total_wins,
                currentWinStreak: s.current_streak,
                bestWinStreak: s.best_streak,
                winRate: s.win_rate 
            }
        }
    };
}
