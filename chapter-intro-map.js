// chapter-intro-map.js - Maps chapters to their intro audio files
const CHAPTER_INTRO_MAP = {
    // Format: 'chapter-number': 'audio-file-name'
    // NOTE: Files are in the audio/ folder, not audio/intro/
    '1-3': 'intro1-3.mp3',
    '4': 'intro4.mp3',
    '5-7': 'intro5-7.mp3',
    '8-10': 'intro8-10.mp3',
    '11': 'intro11.mp3',
    '12-15': 'intro12-15.mp3',
    '16-18': 'intro16-18.mp3',
    '19': 'intro19.mp3',
    '20-22': 'intro20-22.mp3',
    '23': 'intro23.mp3',
    '24-28': 'intro24-28.mp3',
    '29': 'intro29.mp3',
    '30-31': 'intro30-31.mp3',
    '32': 'intro32.mp3',
    '33-35': 'intro33-35.mp3',
    '36-37': 'intro36-37.mp3',
    '38-39': 'intro38-39.mp3'
};

// Helper function to get intro audio path for a chapter
function getChapterIntroAudio(chapterNumber) {
    const fileName = CHAPTER_INTRO_MAP[chapterNumber];
    if (fileName) {
        return `audio/${fileName}`; // Changed from audio/intro/${fileName}
    }
    return null; // No intro audio for this chapter
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHAPTER_INTRO_MAP, getChapterIntroAudio };
} else {
    window.CHAPTER_INTRO_MAP = CHAPTER_INTRO_MAP;
    window.getChapterIntroAudio = getChapterIntroAudio;
}