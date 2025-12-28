# Cannect Vending - Руководство по установке

## Обзор проекта

**Cannect Vending** - это приложение для планшета вендингового автомата с современным дизайном в стиле Cannect.

### Основные изменения:
- ✅ Темная тема с фиолетовым акцентом (#7C3AED)
- ✅ Анимации нажатия на карточки товаров
- ✅ Градиентные кнопки и интерфейс
- ✅ Обновленный дизайн корзины и информационных блоков
- ✅ Адаптация под планшет в landscape режиме
- ✅ Киоск-режим (блокировка навигации Android)

---

## 1. Сборка приложения

### Требования:
- Node.js 18+
- Expo CLI
- Android Studio (опционально, для эмулятора)

### Шаги сборки:

```bash
# 1. Перейти в директорию проекта
cd ~/Desktop/gigross/vending-rn

# 2. Установить зависимости
npm install

# 3. Собрать APK для Android
npx eas build --platform android --profile preview --local

# Или использовать Expo Go для тестирования
npx expo start
```

---

## 2. Установка на Redmi Pad SE

### Подключение планшета:

```bash
# 1. Включите режим разработчика на планшете:
# Настройки > О планшете > Нажмите 7 раз на "Версия MIUI"

# 2. Включите отладку по USB:
# Настройки > Расширенные настройки > Для разработчиков > Отладка по USB

# 3. Подключите планшет к Mac через USB-C

# 4. Проверьте подключение
adb devices

# 5. Установите APK
adb install path/to/cannect-vending.apk

# 6. Запустите приложение
adb shell am start -n com.cannect.vending/.MainActivity
```

### Настройка киоск-режима:

1. **Установите приложение как launcher по умолчанию**:
   - Настройки > Приложения > Приложения по умолчанию > Главный экран
   - Выберите "Cannect Vending"

2. **Отключите уведомления**:
   - Настройки > Уведомления > Отключить все

3. **Настройте автозапуск**:
   - Настройки > Приложения > Автозапуск
   - Включите для "Cannect Vending"

---

## 3. Настройка USB UART для MDB переходника

### Схема подключения:

```
Вендинг-автомат (MDB)
    ↓
MDB-UART конвертер
    ↓
USB-UART адаптер (CH340G/CP2102/FT232RL)
    ↓
USB-C OTG кабель
    ↓
Redmi Pad SE
```

### Компоненты:
- MDB to UART конвертер (MAX3107 или аналог)
- USB-UART чип (CH340G, CP2102, или FTDI FT232RL)
- USB-C OTG адаптер

### Настройка в приложении:

Приложение уже подготовлено для работы с USB Serial. Для активации USB UART коммуникации:

1. **Добавьте библиотеку USB Serial**:
```bash
cd ~/Desktop/gigross/vending-rn
npm install react-native-usb-serialport-for-android
```

2. **Создайте модуль для работы с платежами через MDB**:

```typescript
// src/services/mdbPayment.ts
import { UsbSerialManager } from 'react-native-usb-serialport-for-android';

export class MDBPaymentService {
  private usbManager: any;

  async initializeUSB() {
    this.usbManager = await UsbSerialManager.list();
    console.log('USB devices:', this.usbManager);
  }

  async listenForPayment(callback: (amount: number) => void) {
    // Здесь будет логика прослушивания Pulse сигналов от MDB
    // Когда приходит сигнал оплаты - вызывается callback
  }
}
```

3. **Интегрируйте в CartScreen**:
```typescript
import { MDBPaymentService } from '../services/mdbPayment';

// В handlePayment добавьте:
const mdbService = new MDBPaymentService();
await mdbService.initializeUSB();
await mdbService.listenForPayment((amount) => {
  // Обработка платежа
  console.log('Получена оплата:', amount);
});
```

### Тестирование USB UART:

```bash
# Проверьте, что планшет видит USB устройство
adb shell ls /dev/ttyUSB*
# или
adb shell ls /dev/ttyACM*

# Протестируйте чтение данных
adb shell cat /dev/ttyUSB0
```

---

## 4. Конфигурация API

### Текущие endpoints (vending-back):

Приложение работает с **vending-back.vercel.app**:

```typescript
// src/services/api.ts
const BASE_URL = 'https://vending-back.vercel.app/api';

// Endpoints:
// - POST /device/pair/verify - Подключение автомата
// - GET /products - Получение товаров
// - POST /device/{machineId}/sale - Покупка товара
// - GET /device/{machineId}/status - Статус автомата
// - PUT /device/{deviceId}/heartbeat - Heartbeat
```

### Изменение API URL:

Если нужно изменить URL API:

```typescript
// src/services/api.ts
const BASE_URL = 'https://your-api.com/api';
```

---

## 5. Особенности Redmi Pad SE

### Технические характеристики:
- **Экран**: 11" FHD+ (1920x1200), landscape orientation
- **Процессор**: Snapdragon 680
- **ОЗУ**: 4/6/8 GB
- **ОС**: MIUI 14 (Android 13)
- **USB**: USB-C с OTG поддержкой

### Оптимизация для планшета:

Приложение уже оптимизировано:
- ✅ Landscape orientation
- ✅ 3 колонки товаров в сетке
- ✅ Адаптивные размеры карточек
- ✅ Touch-friendly элементы (min 44x44 dp)
- ✅ Скрытая навигационная панель

---

## 6. Отладка и мониторинг

### Просмотр логов:

```bash
# Логи приложения в реальном времени
adb logcat | grep "ReactNativeJS"

# Логи USB устройств
adb logcat | grep "USB"

# Логи MDB платежей
adb logcat | grep "MDB"
```

### Проверка статуса приложения:

```bash
# Текущее активное приложение
adb shell dumpsys window windows | grep -E 'mCurrentFocus'

# Использование памяти
adb shell dumpsys meminfo com.cannect.vending

# Статус сети
adb shell dumpsys connectivity
```

---

## 7. Troubleshooting

### Проблема: Приложение не устанавливается

```bash
# Удалите старую версию
adb uninstall com.cannect.vending

# Переустановите
adb install -r cannect-vending.apk
```

### Проблема: USB устройство не обнаружено

```bash
# Проверьте права доступа
adb shell su -c "chmod 666 /dev/ttyUSB0"

# Проверьте OTG поддержку
adb shell cat /sys/class/android_usb/android0/enable
```

### Проблема: Приложение вылетает

```bash
# Очистите кэш
adb shell pm clear com.cannect.vending

# Проверьте логи
adb logcat -c && adb logcat | grep "AndroidRuntime"
```

---

## 8. Поддержка и обновления

### Обновление приложения:

```bash
# 1. Соберите новую версию
npx eas build --platform android --profile preview --local

# 2. Установите поверх старой версии
adb install -r new-version.apk
```

### Мониторинг работы:

Используйте vending-back админку для мониторинга:
- https://vending-back.vercel.app/dashboard

---

## Контакты

Если возникли вопросы по установке или настройке, обратитесь к документации:
- Expo: https://docs.expo.dev
- React Native USB Serial: https://github.com/react-native-device/react-native-usb-serialport-for-android
