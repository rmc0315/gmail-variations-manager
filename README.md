# Gmail Variations Manager

A Chrome extension that generates and manages all possible Gmail address variations using the dot trick. Perfect for managing multiple accounts, testing, and organizing your digital life.

![Gmail Variations Manager](https://img.shields.io/badge/version-1.0.1-blue.svg)
![Chrome Web Store](https://img.shields.io/badge/chrome-extension-green.svg)

## 🎯 Features

![image](https://github.com/user-attachments/assets/1662bb05-3927-42e4-abcd-63b41ce5ffac)


- **Generate All Variations**: Instantly create all possible dot combinations of your Gmail address
- **Smart Queue System**: Each website maintains its own email queue
- **Right-Click to Fill**: Quickly fill email fields with the next variation
- **Usage Tracking**: See which emails you've used and where
- **Privacy First**: All data stored locally, never transmitted
- **Export/Import**: Backup your data anytime

## 📦 Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store page](#https://chromewebstore.google.com/detail/gmail-variations-manager/nfadmecgdfoclonkenadmiaajjgndlgh?pli=1) (link coming soon)
2. Click "Add to Chrome"
3. Click "Add Extension"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension folder

## 🚀 Usage

![image](https://github.com/user-attachments/assets/9265750d-5445-46f3-9724-7b95bb1dd204)

### Getting Started
1. Click the extension icon in your toolbar
2. Enter your Gmail address (e.g., `example@gmail.com`)
3. Click "Generate Variations"

### Using on Websites
1. Navigate to any login/signup form
2. Click on the email input field
3. **Right-click** to auto-fill with the next email variation
4. The extension automatically advances to the next email

### Alternative Method
If right-click doesn't work on some sites:
1. Click the extension icon
2. Click "Copy Current Email"
3. Paste into the email field

## 📊 How It Works

Gmail ignores dots in email addresses, so:
- `john.doe@gmail.com`
- `j.ohndoe@gmail.com`
- `johndoe@gmail.com`

All deliver to the same inbox! This extension helps you manage these variations systematically.

## 🔒 Privacy

- **100% Local**: All data stored on your device
- **No Tracking**: No analytics or external connections
- **Open Source**: Inspect the code yourself
- **No Permissions**: Only accesses sites you visit

## 📝 Example Use Cases

- **Multiple Accounts**: Create separate accounts for different services
- **Testing**: QA testing with multiple email variations
- **Organization**: Different emails for work, personal, shopping, etc.
- **Privacy**: Use different variations for different purposes

## 🛠️ Technical Details

### Technologies Used
- Chrome Extension Manifest V3
- JavaScript (ES6+)
- Chrome Storage API
- Content Scripts

### File Structure
```
gmail-variations-manager/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── welcome.html
├── icon16.png
├── icon48.png
└── icon128.png
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors and users
- Inspired by Gmail's dot trick feature
- Built with privacy and simplicity in mind

## 📧 Support

- Create an [Issue](https://github.com/rmc0315/gmail-variations-manager/issues) for bug reports
- Check out the [Wiki](https://github.com/rmc0315/gmail-variations-manager/wiki) for FAQs


---

⭐ If you find this extension useful, please consider starring the repository!
