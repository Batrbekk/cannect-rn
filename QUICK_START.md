# Cannect Vending - Быстрый старт

## 1. Сборка и установка APK (5 минут)

```bash
# Перейти в проект
cd ~/Desktop/gigross/vending-rn

# Установить зависимости (если еще не установлены)
npm install

# Собрать APK локально
npx eas build --platform android --profile preview --local

# APK будет в ./build/
```

## 2. Установка на планшет

```bash
# Подключить Redmi Pad SE через USB-C
# Включить отладку по USB на планшете

# Установить APK
adb install build/cannect-vending.apk

# Запустить
adb shell am start -n com.cannect.vending/.MainActivity
```

## 3. Первый запуск

### На планшете:
1. **Pairing код**: Получите код из админки vending-back
2. **Введите код**: На экране pairing введите 6-значный код
3. **Проверка**: Убедитесь что товары загрузились

### В админке (vending-back.vercel.app/dashboard):
1. Зайдите в раздел "Автоматы"
2. Нажмите "Добавить автомат"
3. Скопируйте pairing код
4. Введите код на планшете

## 4. Настройка киоск-режима

```bash
# На планшете:
# Настройки > Приложения > Приложения по умолчанию > Launcher
# Выберите "Cannect Vending"
```

## 5. Тестирование

### Тест покупки:
1. Откройте приложение
2. Выберите товар
3. Нажмите "+" чтобы добавить в корзину
4. Нажмите "Перейти к покупке"
5. Нажмите "Оплатить"

### Проверка логов:
```bash
# Логи приложения
adb logcat | grep "ReactNativeJS"

# Логи API
adb logcat | grep "API"
```

## 6. Обновление приложения

```bash
# Пересобрать APK
npx eas build --platform android --profile preview --local

# Установить поверх старой версии
adb install -r build/cannect-vending.apk
```

## 7. Быстрые команды

```bash
# Перезапустить приложение
adb shell am force-stop com.cannect.vending
adb shell am start -n com.cannect.vending/.MainActivity

# Очистить данные приложения
adb shell pm clear com.cannect.vending

# Проверить статус
adb shell dumpsys window windows | grep -E 'mCurrentFocus'

# Отключить режим сна
adb shell settings put system screen_off_timeout 2147483647
```

## 8. Troubleshooting

### Проблема: Не подключается к API
```bash
# Проверить интернет
adb shell ping -c 3 vending-back.vercel.app
```

### Проблема: Не видит товары
- Проверьте pairing код
- Перезапустите приложение
- Проверьте в админке что автомат подключен

### Проблема: Черный экран
- Проверьте что StatusBar = "light" в App.tsx
- Перезапустите приложение

## 9. Полезные ссылки

- 📖 [Полное руководство](./INSTALLATION_GUIDE.md)
- 📋 [README с деталями](./README_CANNECT.md)
- 🌐 [Админка](https://vending-back.vercel.app/dashboard)
- 📱 [Expo Docs](https://docs.expo.dev)

## 10. Контакты

Возникли проблемы?
- Проверьте логи: `adb logcat | grep "Error"`
- Обратитесь к INSTALLATION_GUIDE.md
- Проверьте статус в админке
