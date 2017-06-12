client = new Mongo();
db = client.getDB("twitter");

function remove_duplicate(mycollection, myid){
    db[mycollection].find({}, {[myid]:1}).sort({_id:1}).forEach(function(doc){
	db[mycollection].remove({_id:{$gt:doc._id}, [myid]:doc[myid]});
    });
}

function remove_duplicate_double_key(mycollection, myid1, myid2){
    db[mycollection].find({}, {[myid1]:1, [myid2]:1}).sort({_id:1}).forEach(function(doc){
	db[mycollection].remove({_id:{$gt:doc._id}, [myid1]:doc[myid1], [myid2]:doc[myid2]});
    });
}

function remove_duplicate_triple_key(mycollection, myid1, myid2, myid3){
    db[mycollection].find({}, {[myid1]:1, [myid2]:1, [myid3]:1}).sort({_id:1}).forEach(function(doc){
	db[mycollection].remove({_id:{$gt:doc._id}, [myid1]:doc[myid1], [myid2]:doc[myid2], [myid3]:doc[myid3]});
    });
}
