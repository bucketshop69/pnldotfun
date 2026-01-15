"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Clipboard } from "lucide-react";

interface AnimatedInputProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const PLACEHOLDERS = [
  "What's your PnL?",
  "Type transaction hash",
];

const TYPING_SPEED = 100; // ms per character
const ERASING_SPEED = 50; // ms per character
const PAUSE_DURATION = 2000; // ms pause before erasing

export function AnimatedInput({ className, value, onChange }: AnimatedInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [placeholder, setPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Animation logic
  useEffect(() => {
    // Don't animate if user is typing or input is focused
    if (isFocused || inputValue.length > 0) {
      return;
    }

    const currentText = PLACEHOLDERS[currentIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(false);
      }, PAUSE_DURATION);
      return () => clearTimeout(pauseTimer);
    }

    if (isTyping) {
      if (charIndex < currentText.length) {
        const typingTimer = setTimeout(() => {
          setPlaceholder(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, TYPING_SPEED);
        return () => clearTimeout(typingTimer);
      } else {
        // Finished typing, pause before erasing
        setIsPaused(true);
      }
    } else {
      // Erasing
      if (charIndex > 0) {
        const erasingTimer = setTimeout(() => {
          setPlaceholder(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, ERASING_SPEED);
        return () => clearTimeout(erasingTimer);
      } else {
        // Finished erasing, move to next placeholder
        const nextIndex = (currentIndex + 1) % PLACEHOLDERS.length;
        setCurrentIndex(nextIndex);
        setIsTyping(true);
      }
    }
  }, [charIndex, currentIndex, isTyping, isPaused, isFocused, inputValue]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue(text);
      if (onChange) {
        onChange(text);
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  }, [onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Reset animation when unfocused and empty
    if (inputValue.length === 0) {
      setCharIndex(0);
      setPlaceholder("");
      setIsTyping(true);
      setIsPaused(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        style={{ paddingRight: "3.5rem" }} // Space for paste icon
      />
      <button
        onClick={handlePaste}
        className="
          absolute right-4 top-1/2 -translate-y-1/2
          p-2
          text-text-muted hover:text-accent
          transition-colors
          rounded-lg
          hover:bg-white/5
        "
        title="Paste"
        type="button"
      >
        <Clipboard size={18} />
      </button>
    </div>
  );
}
