# Инструкция по сборке APK для Cannect Vending

Проект полностью подготовлен к сборке! Нужно только установить Java и Android SDK.

## Вариант 1: Сборка через EAS Build (Рекомендуется - проще всего)

### Что нужно:
- Expo аккаунт (бесплатный)

### Шаги:

```bash
# 1. Перейти в проект
cd ~/Desktop/gigross/vending-rn

# 2. Войти в Expo аккаунт (или создать новый)
npx expo login

# 3. Собрать APK в облаке
npx eas build --platform android --profile preview

# 4. После сборки (5-10 минут), скачать APK по ссылке из терминала
```

**Преимущества:**
- ✅ Не нужно устанавливать Java/Android SDK
- ✅ Сборка в облаке
- ✅ Первые 30 сборок в месяц бесплатно

---

## Вариант 2: Локальная сборка (требует настройки)

### Шаг 1: Установка Java 17

```bash
# Установить через Homebrew
brew install --cask zulu@17

# После установки проверить:
java -version
# Должно показать: openjdk version "17.0.x"
```

### Шаг 2: Установка Android SDK

```bash
# Установить Android Studio
brew install --cask android-studio

# Или только командные инструменты:
brew install --cask android-commandlinetools
```

### Шаг 3: Настройка переменных окружения

Добавить в `~/.zshrc` (или `~/.bash_profile`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Затем:
```bash
source ~/.zshrc
```

### Шаг 4: Сборка APK

```bash
cd ~/Desktop/gigross/vending-rn

# Собрать release APK
cd android && ./gradlew assembleRelease

# APK будет здесь:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Вариант 3: Быстрая сборка Debug APK (для тестирования)

Если Java уже установлена:

```bash
cd ~/Desktop/gigross/vending-rn/android
./gradlew assembleDebug

# Debug APK:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Установка APK на планшет

После сборки:

```bash
# Подключить Redmi Pad SE через USB
# Включить отладку по USB на планшете

# Установить APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Или для debug версии:
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Запустить приложение
adb shell am start -n com.cannect.vending/.MainActivity
```

---

## Текущее состояние проекта

✅ **Готово:**
- Android проект создан (`./android/`)
- Все зависимости установлены
- Конфигурация EAS Build настроена (`eas.json`)
- Дизайн Cannect применен (темная тема, фиолетовые акценты)
- Package name: `com.cannect.vending`

❌ **Требуется для локальной сборки:**
- Java 17 JDK
- Android SDK (или Android Studio)

---

## Рекомендация

**Используйте Вариант 1 (EAS Build)** - это самый простой и быстрый способ:

```bash
cd ~/Desktop/gigross/vending-rn
npx expo login
npx eas build --platform android --profile preview
```

Через 5-10 минут получите готовый APK файл!

---

## Troubleshooting

### Ошибка: "Unable to locate a Java Runtime"
**Решение:** Установите Java 17 (см. Вариант 2, Шаг 1)

### Ошибка: "ANDROID_HOME is not set"
**Решение:** Настройте переменные окружения (см. Вариант 2, Шаг 3)

### Ошибка при EAS Build: "Not logged in"
**Решение:** Запустите `npx expo login` и войдите в аккаунт

---

## Что дальше?

После получения APK файла:
1. Установите на Redmi Pad SE
2. Следуйте [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) для настройки киоск-режима
3. Подключите к vending-back API
4. Настройте автозапуск
