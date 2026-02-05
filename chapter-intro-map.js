// chapter-intro-map.js - Maps chapters to their intro audio files
const CHAPTER_INTRO_MAP = {
    // Format: 'chapter-number': 'audio-file-name'
    // NOTE: Files are in the audio/ folder, not audio/intro/
    '1-3': 'intro13.mp3',
    '4': 'intro_chapter_4.mp3',
    '5-7': 'intro_chapter_5-7.mp3',
    '8-10': 'intro_chapter_8-10.mp3',
    '11': 'intro_chapter_11.mp3',
    '12-15': 'intro_chapter_12-15.mp3',
    '16-18': 'intro_chapter_16-18.mp3',
    '19': 'intro_chapter_19.mp3',
    '20-22': 'intro_chapter_20-22.mp3',
    '23': 'intro_chapter_23.mp3',
    '24-28': 'intro_chapter_24-28.mp3',
    '29': 'intro_chapter_29.mp3',
    '30-31': 'intro_chapter_30-31.mp3',
    '32': 'intro_chapter_32.mp3',
    '33-35': 'intro_chapter_33-35.mp3',
    '36-37': 'intro_chapter_36-37.mp3',
    '38-39': 'intro_chapter_38-39.mp3'
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