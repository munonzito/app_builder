import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { ChatInput, ChatMessage } from '../components/chat';
import { PreviewPanel } from '../components/preview';
import { BuilderHeader, WelcomePanel } from '../components/builder';
import { useBuilderState } from '../hooks/useBuilderState';
import { Message } from '../models';
import { AppColors, AppSpacing } from '../utils/styles';

export function BuilderScreen() {
  const {
    navigation,
    projectId,
    inputText,
    setInputText,
    showPreview,
    setShowPreview,
    flatListRef,
    isSplitView,
    hasPreview,
    handleBack,
    handleSubmit,
    scrollToBottom,
    projectState,
  } = useBuilderState();

  const {
    currentProject,
    messages,
    isLoading,
    isGenerating,
    cancelGeneration,
    streamingMessage,
    streamingItems,
    planTasks,
  } = projectState;

  const displayMessages = streamingMessage
    ? [...messages, streamingMessage]
    : messages;

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isStreamingMsg = !!streamingMessage && index === displayMessages.length - 1;
    return (
      <ChatMessage
        message={item}
        isStreaming={isStreamingMsg}
        streamItems={isStreamingMsg ? streamingItems : []}
        planTasks={isStreamingMsg ? planTasks : []}
      />
    );
  };

  const renderChatPanel = () => (
    <KeyboardAvoidingView
      style={styles.chatPanel}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.chatPanelInner}>
        {displayMessages.length === 0 && !isGenerating ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.welcomeContainer}>
              <WelcomePanel onSuggestionPress={handleSubmit} />
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={scrollToBottom}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
          />
        )}
        <View style={styles.inputContainer}>
          <ChatInput
            value={inputText}
            onChangeText={setInputText}
            onSubmit={() => handleSubmit()}
            enabled={!isGenerating}
            isGenerating={isGenerating}
            placeholder="Describe what you want to build..."
            onCancel={cancelGeneration}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BuilderHeader
        title={currentProject?.name || 'Loading...'}
        hasPreview={hasPreview}
        showPreview={showPreview}
        onBack={handleBack}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onRunNative={() => navigation.navigate('RuntimePreview', { projectId })}
      />

      {isSplitView ? (
        <View style={styles.splitView}>
          {renderChatPanel()}
          <View style={styles.divider} />
          <View style={styles.previewContainer}>
            <PreviewPanel previewUrl={currentProject?.previewUrl} />
          </View>
        </View>
      ) : showPreview && hasPreview ? (
        <PreviewPanel previewUrl={currentProject?.previewUrl} />
      ) : (
        renderChatPanel()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  splitView: {
    flex: 1,
    flexDirection: 'row',
  },
  chatPanel: {
    flex: 1,
  },
  chatPanelInner: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: AppColors.surface,
  },
  previewContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: AppSpacing.md,
  },
  inputContainer: {
    padding: AppSpacing.md,
    borderTopWidth: 1,
    borderTopColor: AppColors.surface,
  },
});
