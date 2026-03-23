# Data Scraping Notebook - Usage Guide

This notebook provides additional guidance on how to use the functions in `0_data_scraping.ipynb`.

## Quick Start

After running the setup cells (imports, config, API initialization), you can use these functions to collect data:

### Step-by-Step Execution

```python
# Cell 1: Define news sources
news_sources = ["nytimes", "washingtonpost", "business"]

# Cell 2: Collect tweets from news publishers
# This may take several hours for complete data collection
for source in news_sources:
    print(f"\n=== Collecting tweets from @{source} ===")
    get_posts(source)
    print(f"Total posts for {source}: {db.posts.find({'user.screen_name': source}).count()}")

# Cell 3: Get retweeter lists for each tweet
# This identifies who retweeted each article
for source in news_sources:
    print(f"\n=== Getting retweeters for @{source} ===")
    get_retweeter_list_from_posts(source)
    print(f"Total retweeter lists: {db.retweeter_list.count()}")

# Cell 4: Get user information for all retweeters
# This retrieves detailed profiles of users who retweeted
print("\n=== Getting user information ===")
get_users_from_retweeter_list()
print(f"Total users: {db.users.count()}")

# Cell 5: Add source labels to retweeter lists
# (Run the update loops provided in the notebook)
print("\n=== Adding source labels ===")
for retweeter_list in db.retweeter_list.find({}, {"tweet_id":1, "retweeters":1}, no_cursor_timeout=True):
    name = db.posts.find_one({"id": retweeter_list["tweet_id"]})["user"]["screen_name"]
    db.retweeter_list.update_one({"tweet_id": retweeter_list["tweet_id"]}, 
                                  {'$set': {"source": name}}, upsert=True)

for user in db.users.find({}, {"tweet_id":1}, no_cursor_timeout=True):
    name = db.posts.find_one({"id": user["tweet_id"]})["user"]["screen_name"]
    db.users.update_one({"tweet_id": user["tweet_id"]}, 
                        {'$set': {"source": name}}, upsert=True)

print("✓ Source labels added successfully")

# Cell 6: Extract article content (optional)
# Use these functions if you want full article text
# This is resource-intensive and may take hours

# Example: Extract one article
sample_post = db.posts.find_one({"entities.urls": {"$exists": True, "$ne": []}})
if sample_post and sample_post["entities"]["urls"]:
    url = sample_post["entities"]["urls"][0]["expanded_url"]
    print(f"Extracting article from: {url}")
    
    try:
        article = get_article(url)
        doc = article_to_document(article, 1)
        db.articles.insert_one(doc)
        print(f"✓ Article extracted: {article.title}")
    except Exception as e:
        print(f"Error extracting article: {e}")
```

## Minimal Test Run

To quickly verify your setup is working:

```python
# Test with a single source, limited tweets
twitter = Twitter(auth = OAuth(config["access_key"], config["access_secret"], 
                               config["consumer_key"], config["consumer_secret"]))

# Get 5 tweets from NYTimes
results = twitter.statuses.user_timeline(screen_name="nytimes", count=5)

for status in results:
    db.posts.insert_one(status)
    print(f"Tweet ID: {status['id']}")
    print(f"Text: {status['text'][:80]}...")
    print(f"Retweets: {status['retweet_count']}")
    print("---")

print(f"\n✓ Total posts in database: {db.posts.count_documents({})}")

# Get retweeters for one tweet
if results:
    tweet_id = results[0]['id']
    print(f"\nGetting retweeters for tweet {tweet_id}...")
    retweets = twitter.statuses.retweeters.ids(_id=tweet_id)
    print(f"Retweeter IDs: {retweets['ids'][:10]}...")  # Show first 10
    
    db.retweeter_list.update({"tweet_id": tweet_id}, 
                             {'$set': {"retweeters": retweets["ids"]}}, 
                             upsert=True)
    print(f"✓ Retweeter list saved to database")
```

## Data Collection Tips

### Rate Limits
- **User timeline**: 900 requests per 15 minutes
- **Retweeters**: 900 requests per 15 minutes  
- **User lookup**: 900 requests per 15 minutes

The functions automatically handle rate limits by sleeping when limits are reached.

### Expected Data Size
- **Tweets**: 10,000-50,000 posts (depending on collection time)
- **Retweeters**: 50,000-200,000 user IDs
- **User profiles**: 10,000-30,000 unique users
- **Collection time**: 6-24 hours for full dataset

### Monitoring Progress

```python
# Check data collection progress
print("=== Data Collection Status ===")
print(f"Total posts: {db.posts.count_documents({})}")
print(f"Total retweeter lists: {db.retweeter_list.count_documents({})}")
print(f"Total users: {db.users.count_documents({})}")

# Check by source
for source in news_sources:
    count = db.posts.count_documents({"user.screen_name": source})
    print(f"  @{source}: {count} posts")
```

## Common Issues

### Issue: "name 'config' is not defined"
**Solution:** Make sure you ran the `execfile("config.py", config)` cell successfully.

### Issue: "execfile is not defined"
**Solution:** You're using Python 3. Replace with:
```python
with open("config.py") as f:
    code = compile(f.read(), "config.py", 'exec')
    exec(code, config)
```

### Issue: Twitter API returns 401 Unauthorized
**Solution:** Check your API credentials in `config.py` are correct and have proper permissions.

### Issue: MongoDB connection refused
**Solution:** Start MongoDB: `mongod` or `brew services start mongodb`

---

## Next Steps

After data collection is complete:

1. Run `1_exploratory_analysis.ipynb` to visualize the data
2. Run `2_user_network_clustering.ipynb` to identify user groups
3. Run `3_topics_extraction_with_lda.ipynb` to extract topics
4. Run `4_news_recommendation.ipynb` to generate recommendations

---

*Need help? Open an issue at https://github.com/huangy22/NewsRecommender/issues*
