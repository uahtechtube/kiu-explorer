import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface YouTubePlayerProps {
    videoId: string;
    height?: number;
    title?: string;
    channelTitle?: string;
}

const { width } = Dimensions.get('window');

export default function YouTubePlayer({ videoId, height, title, channelTitle }: YouTubePlayerProps) {
    const playerHeight = height || Math.round(width * 0.5625); // 16:9 aspect ratio

    const embedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>body { margin: 0; background-color: #000; overflow: hidden; } iframe { width: 100vw; height: 100vh; border: none; }</style>
      </head>
      <body>
        <iframe 
          src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;

    return (
        <View>
            {/* Player */}
            <View style={[styles.playerContainer, { height: playerHeight }]}>
                <WebView
                    source={{ 
                        html: embedHtml, 
                        baseUrl: 'https://www.youtube-nocookie.com' 
                    }}
                    style={{ flex: 1, backgroundColor: '#000' }}
                    mediaPlaybackRequiresUserAction={false}
                    scrollEnabled={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsInlineMediaPlayback={true}
                    allowsFullscreenVideo={true}
                    originWhitelist={['*']}
                    userAgent="Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36"
                />
            </View>

            {/* Attribution Footer (required by YouTube ToS) */}
            <View style={styles.attribution}>
                <Text style={styles.attributionText}>
                    ▶  Powered by YouTube
                    {channelTitle ? `  •  ${channelTitle}` : ''}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    playerContainer: {
        backgroundColor: '#000',
        width: '100%',
    },
    attribution: {
        backgroundColor: '#f9f9f9',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    attributionText: {
        fontSize: 11,
        color: '#6b7280',
        fontStyle: 'italic',
    },
});
