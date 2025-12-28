# Cannect Vending App

Приложение для планшета вендингового автомата в стиле Cannect.

## 🎨 Дизайн

### Цветовая схема Cannect:
- **Primary**: `#7C3AED` (Фиолетовый)
- **Background**: `#0F172A` (Темный)
- **Background Card**: `#1E293B`
- **Text**: `#F8FAFC` (Светлый)
- **Accent**: `#10B981` (Зеленый для успеха)

### Основные изменения от оригинала:
1. ✅ Темная тема вместо светлой
2. ✅ Фиолетовые акценты вместо красных
3. ✅ Градиентные кнопки и элементы UI
4. ✅ Анимации нажатий (scale animation)
5. ✅ Обновленная типография и spacing
6. ✅ Улучшенные тени и эффекты глубины

## 📱 Скриншоты

### Главный экран (MainScreen)
- Сетка товаров 3x∞
- Темный фон с градиентами
- Плавающая корзина с фиолетовым градиентом
- Адаптивные карточки товаров

### Экран корзины (CartScreen)
- Компактный список товаров
- Информационные блоки (питательные вещества, заказ)
- Фиолетовые иконки и акценты
- Кнопка оплаты с фиолетовым фоном

## 🚀 Быстрый старт

```bash
# Установка зависимостей
cd ~/Desktop/gigross/vending-rn
npm install

# Запуск в режиме разработки
npm start

# Сборка APK
npx eas build --platform android --profile preview --local
```

## 📦 Структура проекта

```
vending-rn/
├── src/
│   ├── components/
│   │   ├── ProductCard.tsx       # Карточка товара с анимацией
│   │   ├── MachineStatusBar.tsx  # Статус автомата
│   │   └── VideoIntroScreen.tsx  # Видео заставка
│   ├── screens/
│   │   ├── MainScreen.tsx        # Главный экран с товарами
│   │   ├── CartScreen.tsx        # Корзина
│   │   ├── PurchaseScreen.tsx    # Покупка
│   │   ├── PaymentSuccessScreen.tsx # Успешная оплата
│   │   └── PairingScreen.tsx     # Подключение автомата
│   ├── services/
│   │   └── api.ts                # API клиент (vending-back)
│   ├── store/
│   │   ├── cartStore.ts          # Zustand store для корзины
│   │   └── appStore.ts           # Zustand store для приложения
│   ├── constants/
│   │   └── theme.ts              # Цветовая схема Cannect
│   └── navigation/
│       └── AppNavigator.tsx      # Навигация
├── App.tsx                       # Точка входа
├── app.json                      # Конфигурация Expo
└── INSTALLATION_GUIDE.md         # Руководство по установке
```

## 🔧 Конфигурация

### API Endpoints (vending-back.vercel.app)

```typescript
// src/services/api.ts
const BASE_URL = 'https://vending-back.vercel.app/api';

// Endpoints:
POST   /device/pair/verify          # Подключение автомата
GET    /products                    # Список товаров
GET    /device/{id}/status          # Статус автомата
POST   /device/{id}/sale            # Покупка товара
PUT    /device/{id}/heartbeat       # Heartbeat
```

### Цветовая тема

```typescript
// src/constants/theme.ts
export const Colors = {
  primary: '#7C3AED',           // Фиолетовый
  background: '#0F172A',        // Темный фон
  backgroundCard: '#1E293B',    // Карточки
  text: '#F8FAFC',             // Светлый текст
  // ... и другие
};
```

## 🎯 Основные фичи

### 1. Киоск-режим
- Блокировка кнопки "Назад" Android
- Скрытие панели навигации
- Полноэкранный режим
- Автозапуск при включении планшета

### 2. Интеграция с вендинг-автоматом
- Pairing через API ключ
- Синхронизация остатков товаров
- Heartbeat для мониторинга
- Статус автомата в реальном времени

### 3. Система корзины
- Добавление/удаление товаров
- Изменение количества
- Валидация доступного количества
- Расчет общей суммы

### 4. USB UART для оплаты
- Поддержка MDB протокола
- Pulse сигналы от платежного терминала
- Интеграция с vending-back после оплаты

## 📲 Установка на Redmi Pad SE

Подробное руководство см. в [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)

### Краткая инструкция:

```bash
# 1. Включите отладку по USB на планшете
# 2. Подключите планшет к компьютеру
# 3. Установите APK
adb install cannect-vending.apk

# 4. Запустите приложение
adb shell am start -n com.cannect.vending/.MainActivity
```

## 🎨 Темизация

Все цвета, размеры и отступы настраиваются через:

```typescript
// src/constants/theme.ts
export const Colors = { /* ... */ };
export const Spacing = { /* ... */ };
export const BorderRadius = { /* ... */ };
export const FontSizes = { /* ... */ };
```

## 🔌 USB UART Setup

Для подключения MDB переходника:

```
Вендинг → MDB-UART → USB-UART → USB-C OTG → Планшет
```

Библиотека: `react-native-usb-serialport-for-android`

Подробнее см. в [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md#3-настройка-usb-uart-для-mdb-переходника)

## 📝 TODO

- [ ] Добавить react-native-usb-serialport-for-android
- [ ] Реализовать модуль MDBPaymentService
- [ ] Интегрировать USB UART в CartScreen
- [ ] Создать иконки и splash screen в стиле Cannect
- [ ] Настроить автозапуск на планшете
- [ ] Добавить логирование и аналитику

## 🐛 Troubleshooting

### Проблема: Темный экран после запуска
**Решение**: Проверьте `StatusBar` в App.tsx - должен быть `style="light"`

### Проблема: Карточки не анимируются
**Решение**: Убедитесь что `react-native-reanimated` правильно установлен

### Проблема: API недоступен
**Решение**: Проверьте `usesCleartextTraffic: true` в app.json

## 📚 Документация

- [Installation Guide](./INSTALLATION_GUIDE.md) - Полное руководство по установке
- [Expo Docs](https://docs.expo.dev) - Документация Expo
- [React Native](https://reactnative.dev) - Документация React Native

## 🤝 Contributing

Для внесения изменений:

1. Создайте ветку для фичи
2. Внесите изменения с сохранением стиля кода
3. Протестируйте на реальном устройстве
4. Создайте Pull Request

## 📄 License

Proprietary - Cannect 2025
