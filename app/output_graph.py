#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import sys
import csv
import json
import pprint
from pymongo import MongoClient
import numpy as np
import pprint

def SaveDict(filename, mode, root):
    if filename[-4:]!=".txt":
        filename+=".txt"
    with open(filename, mode) as f:
        f.write(pprint.pformat(root))

def LoadDict(filename):
    if filename[-4:]!=".txt":
        filename+=".txt"
    with open(filename, "r") as f:
        return eval(f.read())

client = MongoClient()
db = client.twitter
users = db["active_users"]
links = db["significant_links"]

nodes = []
ids = []
for user in users.find():
    if "fast_greedy_label" in user and user["fast_greedy_label"] == 0:
        if user["count"] >= 10:
            nodes.append({"name": user["name"], "value": user["count"], "group": user["fast_greedy_label"]})
            ids.append(user["_id"])
print "number of nodes: ", len(nodes)

edges = []
for link in links.find():
    if link["_id"]["user1"] in ids and link["_id"]["user2"] in ids:
        edges.append({"source": ids.index(link["_id"]["user1"]), "target": ids.index(link["_id"]["user2"]), "value": link["similarity"]})
print "number of edges: ", len(edges)

graph = {"links": edges, "nodes": nodes} 

# Writes the json output to the file
file("./data/user_network_group0.json", 'w').write(json.dumps(graph))

