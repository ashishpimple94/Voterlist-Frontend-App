# 🔐 Environment Variables Setup for Vercel

## 📋 Environment Variables

Vercel पर deploy करने के लिए, ये environment variables add करें:

### Vercel Dashboard में Add करें:

1. Vercel Dashboard खोलें: https://vercel.com/dashboard
2. अपना project select करें
3. **Settings** → **Environment Variables** पर जाएं
4. ये variables add करें:

```
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=741032182432100
REACT_APP_WHATSAPP_API_KEY=798422d2-818f-11f0-98fc-02c8a5e042bd
REACT_APP_WHATSAPP_API_URL=https://waba.xtendonline.com/v3
REACT_APP_ENV=production
```

### Vercel CLI से Add करें:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add variables
vercel env add REACT_APP_WHATSAPP_PHONE_NUMBER_ID production
# Enter value: 741032182432100

vercel env add REACT_APP_WHATSAPP_API_KEY production
# Enter value: 798422d2-818f-11f0-98fc-02c8a5e042bd

vercel env add REACT_APP_WHATSAPP_API_URL production
# Enter value: https://waba.xtendonline.com/v3

vercel env add REACT_APP_ENV production
# Enter value: production
```

## ✅ Variables List:

| Variable Name | Value | Required |
|--------------|-------|----------|
| `REACT_APP_WHATSAPP_PHONE_NUMBER_ID` | `741032182432100` | ✅ Yes |
| `REACT_APP_WHATSAPP_API_KEY` | `798422d2-818f-11f0-98fc-02c8a5e042bd` | ✅ Yes |
| `REACT_APP_WHATSAPP_API_URL` | `https://waba.xtendonline.com/v3` | ❌ No (optional) |
| `REACT_APP_ENV` | `production` | ❌ No (optional) |

## 🔍 Verification:

1. Vercel Dashboard → Settings → Environment Variables
2. सभी variables check करें
3. Redeploy करें (अगर variables add करने के बाद)

## ⚠️ Important:

- Variables `REACT_APP_` prefix के साथ होने चाहिए
- Production environment में add करें
- Variables add करने के बाद **Redeploy** जरूरी है

---

**Ready for deployment!** 🚀

