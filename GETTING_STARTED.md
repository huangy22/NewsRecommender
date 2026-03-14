# Getting Started Guide

This guide provides step-by-step instructions to set up and run the News4U recommendation system.

## Prerequisites

Before running the notebooks, ensure you have the following:

1. **Twitter Developer Account**
   - Create a Twitter Developer account at https://developer.twitter.com
   - Create a new application to get API keys
   - Generate Access Token and Access Token Secret

2. **MongoDB**
   - Install MongoDB on your local machine
   - Default connection: `mongodb://localhost:27017/`
   - The system will create a database named `twitter`

3. **Python Dependencies**
   ```bash
   pip install twitter pymongo newspaper3k json time
   ```

## Setup Instructions

### Step 1: Configure API Credentials

1. Copy the example configuration file:
   ```bash
   cp config.example.py config.py
   ```

2. Edit `config.py` and add your Twitter API credentials:
   ```python
   config = {
       "access_key": "YOUR_ACTUAL_ACCESS_KEY",
       "access_secret": "YOUR_ACTUAL_ACCESS_SECRET",
       "consumer_key": "YOUR_ACTUAL_CONSUMER_KEY",
       "consumer_secret": "YOUR_ACTUAL_CONSUMER_SECRET"
   }
   ```

### Step 2: Start MongoDB

Ensure MongoDB is running:
```bash
# On macOS with Homebrew
brew services start mongodb

# On Ubuntu/Linux
sudo systemctl start mongod

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

### Step 3: Data Collection (0_data_scraping.ipynb)

The data scraping notebook collects tweets from news publishers and retweet information.

**Execute cells in this order:**

1. **Import libraries and connect to MongoDB**
   - Run the first cell to import dependencies
   - MongoDB will create a `twitter` database automatically

2. **Load configuration**
   - The `execfile("config.py", config)` line will load your API credentials

3. **Initialize Twitter API client**
   - Creates authenticated Twitter API object

4. **Collect data from news publishers**
   
   The notebook contains several functions. Call them in this sequence:
   
   ```python
   # Step 4a: Collect tweets from news publishers
   news_sources = ["nytimes", "washingtonpost", "business"]
   
   for source in news_sources:
       get_posts(source)
   
   # Step 4b: Get retweeter lists for each tweet
   for source in news_sources:
       get_retweeter_list_from_posts(source)
   
   # Step 4c: Get user information for retweeters
   get_users_from_retweeter_list()
   
   # Step 4d: Add source labels to retweeter lists
   # (The two update loops in the notebook)
   
   # Step 4e: Extract article content (optional)
   # Use get_article() and article_to_document() for full text
   ```

**Note:** Data collection can take several hours due to Twitter API rate limits. The script includes automatic rate limit handling.

### Step 4: Exploratory Analysis (1_exploratory_analysis.ipynb)

After collecting data, run the exploratory analysis:

```bash
jupyter notebook 1_exploratory_analysis.ipynb
```

This notebook:
- Analyzes the distribution of tweets
- Explores user engagement patterns
- Prepares data for clustering

### Step 5: User Network Clustering (2_user_network_clustering.ipynb)

Run the clustering notebook to identify user groups:

```bash
jupyter notebook 2_user_network_clustering.ipynb
```

This notebook:
- Builds user similarity network
- Applies hierarchical clustering
- Identifies reader communities

### Step 6: Topic Extraction (3_topics_extraction_with_lda.ipynb)

Extract topics from news articles:

```bash
jupyter notebook 3_topics_extraction_with_lda.ipynb
```

This notebook:
- Trains LDA model on article texts
- Identifies latent topics
- Creates topic distributions for user groups

### Step 7: Generate Recommendations (4_news_recommendation.ipynb)

Finally, generate news recommendations:

```bash
jupyter notebook 4_news_recommendation.ipynb
```

This notebook:
- Matches new articles to user group interests
- Ranks articles by topic similarity
- Evaluates recommendation quality

## Troubleshooting

### Issue: "execfile config.py" error

**Solution:** Make sure you've created `config.py` from `config.example.py` and filled in your credentials.

### Issue: MongoDB connection error

**Solution:** 
- Verify MongoDB is running: `mongo --eval "db.version()"`
- Check connection string in notebook (default: `MongoClient()`)

### Issue: Twitter API rate limit exceeded

**Solution:** The script automatically handles rate limits by sleeping for 15 minutes. Just wait and let it continue.

### Issue: No data appears in database

**Solution:**
1. Check your API credentials are correct
2. Verify the news source Twitter handles are valid
3. Run the `get_posts()` function first to collect initial data

## Data Flow Diagram

```
1. Scrape tweets → MongoDB (twitter.posts)
2. Get retweeters → MongoDB (twitter.retweeter_list)
3. Get user info → MongoDB (twitter.users)
4. Extract articles → MongoDB (twitter.articles)
5. Build network → User clusters
6. Train LDA → Topic models
7. Match topics → Recommendations
```

## Expected Output

After running all notebooks, you should have:

- **twitter.posts**: ~10,000+ tweets from news sources
- **twitter.retweeter_list**: Retweeter IDs for each tweet
- **twitter.users**: User profiles of retweeters
- **User clusters**: 6 reader groups with different interests
- **Topic models**: ~20 topics covering news categories
- **Recommendations**: Ranked article lists for each user group

## Quick Start (Minimal Test)

To quickly test the system with minimal data:

```python
# In 0_data_scraping.ipynb, after setup cells:

# Test with one news source, limited tweets
twitter = Twitter(auth = OAuth(config["access_key"], config["access_secret"], 
                               config["consumer_key"], config["consumer_secret"]))

# Get 10 tweets from NYTimes
results = twitter.statuses.user_timeline(screen_name="nytimes", count=10)
for status in results:
    db.posts.insert_one(status)
    print(f"Tweet: {status['text'][:50]}...")

# Check database
print(f"Total posts: {db.posts.count_documents({})}")
```

This will verify your setup is working correctly before running the full collection.

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review the notebook error messages
3. Open an issue on GitHub with:
   - Error message
   - Your Python version
   - MongoDB version
   - Which notebook cell failed

---

*Last updated: 2026-03-14*
