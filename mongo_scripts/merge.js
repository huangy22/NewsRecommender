client = new Mongo();
db = client.getDB("twitter");

function merge_users(user_retweets){
    db[user_retweets].aggregate({$group: {_id: "$user.id", name: {$first: "$user.name"}, tweet_ids: {$addToSet: "$tweet_id"}, count: {$sum: 1}}},
				{$sort:  {count: -1}},
				{$out: "user_merge"});
}

function merge_links(links, link_merge){
    db[links].aggregate([{$group: {_id: {user1: "$user1", user2: "$user2"}, tweet_ids: {$addToSet: "$tweet_id"}}},
			{$addFields: {number_tweets: {$size: "$tweet_ids"}}},
			{$sort:  {number_tweets: -1}},
			{$out: link_merge}],
			{allowDiskUse: true});
}
