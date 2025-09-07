# GitHub Pages Setup & OAuth Configuration

## Your App is Now Deployed! 🎉

Your code has been pushed to: https://github.com/deepanshuvermaa/Todo-App

## Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/deepanshuvermaa/Todo-App
2. Click on **Settings** (in the repository menu)
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**
6. Wait 2-5 minutes for deployment

## Step 2: Your GitHub Pages URLs

Once deployed, your app will be available at:
- **Live App**: https://deepanshuvermaa.github.io/Todo-App/
- **Test Page**: https://deepanshuvermaa.github.io/Todo-App/test.html

## Step 3: Add These URLs to Google OAuth

Now go back to Google Cloud Console and add these URLs:

### Authorized JavaScript Origins:
Add ALL of these (click "Add URI" for each):
```
http://localhost:8080
http://127.0.0.1:8080
https://deepanshuvermaa.github.io
```

### Authorized Redirect URIs:
You can leave this empty for now (it's for server-side auth)

## Step 4: Update Your API Key Restrictions

1. Go to **APIs & Services** → **Credentials**
2. Click on your API Key
3. Under **Application restrictions**:
   - Select **HTTP referrers (websites)**
4. Under **Website restrictions**, add:
```
http://localhost:8080/*
http://127.0.0.1:8080/*
https://deepanshuvermaa.github.io/*
```
5. Click **Save**

## Step 5: Important Notes

- It takes **5-10 minutes** for Google OAuth changes to take effect
- GitHub Pages takes **2-5 minutes** to deploy after pushing
- Clear your browser cache if you see old versions

## Step 6: Test Your Deployment

1. First, check if GitHub Pages is active:
   - Go to: https://github.com/deepanshuvermaa/Todo-App/settings/pages
   - You should see: "Your site is live at https://deepanshuvermaa.github.io/Todo-App/"

2. Test the app:
   - Open: https://deepanshuvermaa.github.io/Todo-App/test.html
   - Run the tests to verify everything works

3. Use the main app:
   - Open: https://deepanshuvermaa.github.io/Todo-App/

## What Your Users Will See

When users visit your app and click "Connect Google Account":
1. They'll see Google's sign-in page
2. Google will show: "Todo App wants to access your Google Account"
3. They click "Allow"
4. App creates their personal Google Sheet
5. Their tasks sync automatically

## Troubleshooting

### "Invalid Origin" Error
- Make sure you added `https://deepanshuvermaa.github.io` to Authorized JavaScript origins
- Wait 5-10 minutes for changes to propagate
- Clear browser cache

### GitHub Pages Not Working
- Check Settings → Pages in your repository
- Make sure it's set to deploy from main branch
- Wait a few minutes and refresh

### API Key Errors
- Verify your API key restrictions include the GitHub Pages domain
- Check that Google Sheets API is enabled
- Make sure config.js has the correct credentials

## Next Steps

1. ✅ Your app is deployed at: https://deepanshuvermaa.github.io/Todo-App/
2. ✅ Add the URLs above to Google OAuth settings
3. ✅ Wait 10 minutes for everything to propagate
4. ✅ Test with your Google account
5. ✅ Share with users!

Your app is now live and anyone can use it by visiting your GitHub Pages URL!