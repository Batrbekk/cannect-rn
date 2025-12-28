package com.ztl.vending;

import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * React Native модуль для работы с UART портом вендинга
 * Использует прямой доступ к /dev/ttyS3 через FileInputStream/FileOutputStream
 */
public class VendingSerialModule extends ReactContextBaseJavaModule {
    private static final String TAG = "VendingSerial";
    private static final String MODULE_NAME = "VendingSerial";

    private FileInputStream mInputStream;
    private FileOutputStream mOutputStream;
    private ReadThread mReadThread;
    private ReactApplicationContext mReactContext;
    private String mPortPath;

    public VendingSerialModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * Открыть serial порт
     * @param port Путь к устройству (например, "/dev/ttyS3")
     * @param baudrate Скорость (19200 для вендинга) - игнорируется, настраивается на уровне системы
     * @param promise Promise для результата
     */
    @ReactMethod
    public void open(String port, int baudrate, Promise promise) {
        try {
            if (mInputStream != null || mOutputStream != null) {
                close(null);
            }

            Log.d(TAG, "Открываем serial порт: " + port);

            mPortPath = port;
            File device = new File(port);

            if (!device.exists()) {
                Log.e(TAG, "Устройство не существует: " + port);
                promise.reject("OPEN_ERROR", "Устройство не существует: " + port);
                return;
            }

            // Открываем порт для чтения и записи
            mInputStream = new FileInputStream(device);
            mOutputStream = new FileOutputStream(device);

            // Запускаем поток чтения
            mReadThread = new ReadThread();
            mReadThread.start();

            WritableMap result = Arguments.createMap();
            result.putString("port", port);
            result.putInt("baudrate", baudrate);
            result.putBoolean("success", true);

            Log.d(TAG, "Serial порт успешно открыт");
            promise.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Ошибка открытия serial порта", e);
            promise.reject("OPEN_ERROR", e.getMessage());
        }
    }

    /**
     * Закрыть serial порт
     */
    @ReactMethod
    public void close(Promise promise) {
        try {
            if (mReadThread != null) {
                mReadThread.interrupt();
                mReadThread = null;
            }

            if (mInputStream != null) {
                try {
                    mInputStream.close();
                } catch (IOException e) {
                    Log.e(TAG, "Ошибка закрытия InputStream", e);
                }
                mInputStream = null;
            }

            if (mOutputStream != null) {
                try {
                    mOutputStream.close();
                } catch (IOException e) {
                    Log.e(TAG, "Ошибка закрытия OutputStream", e);
                }
                mOutputStream = null;
            }

            Log.d(TAG, "Serial порт закрыт");

            if (promise != null) {
                promise.resolve(true);
            }
        } catch (Exception e) {
            Log.e(TAG, "Ошибка закрытия serial порта", e);
            if (promise != null) {
                promise.reject("CLOSE_ERROR", e.getMessage());
            }
        }
    }

    /**
     * Записать данные в serial порт
     * @param data Строка команды для отправки
     * @param promise Promise для результата
     */
    @ReactMethod
    public void write(String data, Promise promise) {
        try {
            if (mOutputStream == null) {
                promise.reject("NOT_OPEN", "Serial порт не открыт");
                return;
            }

            byte[] bytes = data.getBytes("UTF-8");
            mOutputStream.write(bytes);
            mOutputStream.flush();

            // Логируем отправленные данные в hex формате
            Log.d(TAG, "Отправлено: " + data + " | HEX: " + bytesToHex(bytes));
            promise.resolve(true);

        } catch (IOException e) {
            Log.e(TAG, "Ошибка записи в serial порт", e);
            promise.reject("WRITE_ERROR", e.getMessage());
        }
    }

    /**
     * Проверить, открыт ли serial порт
     */
    @ReactMethod
    public void isOpen(Promise promise) {
        promise.resolve(mInputStream != null && mOutputStream != null);
    }

    /**
     * Поток чтения данных из serial порта
     */
    private class ReadThread extends Thread {
        @Override
        public void run() {
            byte[] buffer = new byte[1024];
            Log.d(TAG, "ReadThread запущен, ожидание данных...");

            while (!isInterrupted() && mInputStream != null) {
                try {
                    int size = mInputStream.read(buffer);

                    if (size > 0) {
                        // Создаем массив с актуальными данными
                        byte[] received = new byte[size];
                        System.arraycopy(buffer, 0, received, 0, size);

                        String receivedStr = new String(received, 0, size, "UTF-8");

                        // Детальное логирование с HEX данными
                        Log.d(TAG, "Получено " + size + " байт");
                        Log.d(TAG, "Получено (строка): " + receivedStr);
                        Log.d(TAG, "Получено (HEX): " + bytesToHex(received));

                        // Отправляем событие в React Native
                        WritableMap params = Arguments.createMap();
                        params.putString("data", receivedStr);
                        sendEvent("onSerialData", params);
                    }

                } catch (IOException e) {
                    if (!isInterrupted()) {
                        Log.e(TAG, "Ошибка чтения из serial порта", e);

                        // Отправляем событие об ошибке
                        WritableMap params = Arguments.createMap();
                        params.putString("error", e.getMessage());
                        sendEvent("onSerialError", params);
                    }
                    return;
                }
            }

            Log.d(TAG, "ReadThread завершен");
        }
    }

    /**
     * Конвертировать байты в HEX строку для отладки
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X ", b));
        }
        return sb.toString().trim();
    }

    /**
     * Отправить событие в React Native
     */
    private void sendEvent(String eventName, WritableMap params) {
        if (mReactContext.hasActiveCatalystInstance()) {
            mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }
}
