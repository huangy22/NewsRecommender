client = new Mongo();
db = client.getDB("twitter");

function subset_users(user_merge, threshold){
    db[user_merge].aggregate({$match: {count: {$gt: threshold}}},
			     {$out: "user_merge_subset"});
}

function subset_links(links, link_subset, user_subset){
    db[link_subset].drop();
    db[links].find().forEach(function(doc){
	if(db[user_subset].findOne({ _id: doc["_id"]["user1"]})){
	    if(db[user_subset].findOne({ _id: doc["_id"]["user2"]})){
		db[link_subset].save(doc);
	    }
	}});
}
