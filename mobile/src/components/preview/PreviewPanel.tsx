import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { ApiConfig } from '../../config/api';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface PreviewPanelProps {
  previewUrl?: string;
  onRefresh?: () => void;
}

export function PreviewPanel({ previewUrl, onRefresh }: PreviewPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingPlayerUrl, setIsFetchingPlayerUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);

  const extractProjectId = (url?: string): string | null => {
    if (!url) return null;
    const regex = /\/preview\/([^/]+)/;
    const match = url.match(regex);
    return match?.[1] || null;
  };

  const fetchPlayerUrl = async () => {
    const projectId = extractProjectId(previewUrl);
    if (!projectId) return;

    if (projectId === lastProjectId && playerUrl) return;

    setIsFetchingPlayerUrl(true);
    setError(null);

    try {
      const url = `${ApiConfig.baseUrl}/api/preview/snack/${projectId}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const playerPath = data.playerURL;
        if (playerPath) {
          const fullPlayerUrl = `${ApiConfig.baseUrl}${playerPath}`;
          setPlayerUrl(fullPlayerUrl);
          setLastProjectId(projectId);
        } else {
          throw new Error('No playerURL in response');
        }
      } else {
        throw new Error(`Failed to fetch preview: ${response.status}`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsFetchingPlayerUrl(false);
    }
  };

  useEffect(() => {
    fetchPlayerUrl();
  }, [previewUrl]);

  const handleRefresh = () => {
    setPlayerUrl(null);
    setLastProjectId(null);
    fetchPlayerUrl();
    onRefresh?.();
  };

  const projectId = extractProjectId(previewUrl);

  if (!projectId) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="phone-portrait-outline"
          size={64}
          color={`${AppColors.textSecondary}80`}
        />
        <Text style={styles.emptyTitle}>No preview available</Text>
        <Text style={styles.emptySubtitle}>Start chatting to generate your app</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={`${AppColors.textSecondary}80`}
        />
        <Text style={styles.emptyTitle}>Preview Error</Text>
        <Text style={styles.emptySubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="phone-portrait-outline" size={18} color={AppColors.primary} />
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={18} color={AppColors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.webviewContainer}>
        {(isFetchingPlayerUrl || !playerUrl) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Preparing preview...</Text>
          </View>
        ) : (
          <>
            <WebView
              source={{ uri: playerUrl }}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={(e) => setError(e.nativeEvent.description)}
              userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
            />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={AppColors.primary} />
                <Text style={styles.loadingText}>Loading app...</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background,
  },
  headerTitle: {
    ...AppTypography.mono,
    marginLeft: AppSpacing.sm,
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    color: '#999999',
    marginTop: AppSpacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    paddingHorizontal: AppSpacing.xl,
  },
  emptyTitle: {
    ...AppTypography.mono,
    color: AppColors.textSecondary,
    marginTop: AppSpacing.md,
  },
  emptySubtitle: {
    ...AppTypography.monoSmall,
    color: `${AppColors.textSecondary}B3`,
    marginTop: AppSpacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: AppSpacing.lg,
    backgroundColor: AppColors.primary,
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.sm,
    borderRadius: AppSpacing.borderRadius,
  },
  retryText: {
    ...AppTypography.mono,
    color: AppColors.textPrimary,
  },
});
