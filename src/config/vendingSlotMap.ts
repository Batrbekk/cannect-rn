import { VendingSlotPosition } from '../types';

/**
 * Конфигурация расположения товаров в вендинговом автомате
 * Сетка: 6 рядов × 10 колонок × 4 глубины
 * - 60 слотов всего
 * - 4 продукта в глубину каждого слота
 * - Максимум 240 продуктов
 *
 * Ряды: 1-6 (сверху вниз)
 * Колонки: 1-10 (слева направо)
 * Глубина: 1-4 (спираль крутится 4 раза)
 *
 * Для одного товара на весь вендинг:
 * - Начинаем выдачу с ряда 6, колонка 1, глубина 1
 * - Выдаем все 4 продукта из слота (глубина 1→2→3→4)
 * - Переходим к следующей колонке (2, 3...10)
 * - После колонки 10 переходим на ряд 5, и так далее
 */

export const VENDING_SLOT_MAP: Record<string, VendingSlotPosition> = {
  // ===== РЯД 1 (Премиум) =====
  // Колонка 1-5: MeccaCola варианты
  '68c25c7ad57599908273ac15': { row: 1, column: 1 }, // MeccaCola Classic
  '68c25b40d57599908273abb3': { row: 1, column: 2 }, // MeccaCola Pomegranate
  '68c26e88d57599908273ac9e': { row: 1, column: 3 }, // MeccaCola White Grape
  '68c25c37d57599908273ac10': { row: 1, column: 4 }, // MeccaCola Classic 500ml
  '68c25be9d57599908273abba': { row: 1, column: 5 }, // MeccaCola Diet

  // Колонка 6-10: Премиум напитки
  '68c26f84d57599908273aca9': { row: 1, column: 6 }, // ZamZam Premium
  '68c26fb0d57599908273acac': { row: 1, column: 7 }, // Al Ain Water
  '68c26fe4d57599908273acaf': { row: 1, column: 8 }, // Barakat Juice
  '68c2700fd57599908273acb2': { row: 1, column: 9 }, // Halal Energy Drink
  '68c2703cd57599908273acb5': { row: 1, column: 10 }, // Fresh Date Juice

  // ===== РЯД 2 (Премиум снеки) =====
  '68c27064d57599908273acb8': { row: 2, column: 1 }, // Premium Dates
  '68c2708dd57599908273acbb': { row: 2, column: 2 }, // Halal Chips Original
  '68c270b5d57599908273acbe': { row: 2, column: 3 }, // Turkish Delight
  '68c270ddd57599908273acc1': { row: 2, column: 4 }, // Baklava Bites
  '68c27106d57599908273acc4': { row: 2, column: 5 }, // Pistachio Cookies

  // ===== РЯД 3 (Основные напитки) =====
  '68c2712ed57599908273acc7': { row: 3, column: 1 }, // Orange Juice
  '68c27155d57599908273acca': { row: 3, column: 2 }, // Apple Juice
  '68c2717bd57599908273accd': { row: 3, column: 3 }, // Mango Nectar
  '68c271a1d57599908273acd0': { row: 3, column: 4 }, // Lemon Mint
  '68c271c8d57599908273acd3': { row: 3, column: 5 }, // Rose Water Drink

  // ===== РЯД 4 (Основные снеки) =====
  '68c271edd57599908273acd6': { row: 4, column: 1 }, // Mixed Nuts
  '68c27213d57599908273acd9': { row: 4, column: 2 }, // Cheese Crackers
  '68c27238d57599908273acdc': { row: 4, column: 3 }, // Protein Bar
  '68c2725ed57599908273acdf': { row: 4, column: 4 }, // Granola Bar
  '68c27283d57599908273ace2': { row: 4, column: 5 }, // Rice Crisps

  // ===== РЯД 5 (Популярные товары - быстрый доступ) =====
  '68c272a8d57599908273ace5': { row: 5, column: 1 }, // Bestseller 1
  '68c272cdd57599908273ace8': { row: 5, column: 2 }, // Bestseller 2
  '68c272f2d57599908273aceb': { row: 5, column: 3 }, // Bestseller 3
  '68c27317d57599908273acee': { row: 5, column: 4 }, // Bestseller 4
  '68c2733cd57599908273acf1': { row: 5, column: 5 }, // Bestseller 5

  // ===== РЯД 6 (Самые популярные - нижний ряд) =====
  '68c27361d57599908273acf4': { row: 6, column: 1 }, // Top Product 1
  '68c27386d57599908273acf7': { row: 6, column: 2 }, // Top Product 2
  '68c273abd57599908273acfa': { row: 6, column: 3 }, // Top Product 3
  '68c273d0d57599908273acfd': { row: 6, column: 4 }, // Top Product 4
  '68c273f5d57599908273ad00': { row: 6, column: 5 }, // Top Product 5
  '68c2741ad57599908273ad03': { row: 6, column: 6 }, // Top Product 6
  '68c2743fd57599908273ad06': { row: 6, column: 7 }, // Top Product 7
  '68c27464d57599908273ad09': { row: 6, column: 8 }, // Top Product 8
  '68c27489d57599908273ad0c': { row: 6, column: 9 }, // Top Product 9
  '68c274aed57599908273ad0f': { row: 6, column: 10 }, // Top Product 10
};

// Функция для получения позиции товара
export function getProductSlotPosition(productId: string): VendingSlotPosition | null {
  return VENDING_SLOT_MAP[productId] || null;
}

// Функция для проверки, занят ли слот
export function isSlotOccupied(row: number, column: number): boolean {
  return Object.values(VENDING_SLOT_MAP).some(
    pos => pos.row === row && pos.column === column
  );
}

// Функция для получения свободных слотов
export function getAvailableSlots(): VendingSlotPosition[] {
  const allSlots: VendingSlotPosition[] = [];

  for (let row = 1; row <= 6; row++) {
    for (let column = 1; column <= 10; column++) {
      if (!isSlotOccupied(row, column)) {
        allSlots.push({ row, column });
      }
    }
  }

  return allSlots;
}

// Визуализация сетки слотов (для отладки)
export function printSlotGrid(): void {
  console.log('=== Сетка вендингового автомата ===');
  console.log('   1  2  3  4  5  6  7  8  9  10');

  for (let row = 1; row <= 6; row++) {
    let rowStr = `${row}: `;
    for (let column = 1; column <= 10; column++) {
      rowStr += isSlotOccupied(row, column) ? '[X]' : '[ ]';
    }
    console.log(rowStr);
  }

  console.log('===================================');
  console.log('[X] - занято, [ ] - свободно');
}