-- Limpiar imágenes sin turno asignado
DELETE FROM "menu_images";

-- Agregar turno por imagen (desayuno, almuerzo, cena)
ALTER TABLE "menu_images" ADD COLUMN "shift" "MealShift" NOT NULL;

-- Una imagen por turno por menú
CREATE UNIQUE INDEX "menu_images_menu_id_shift_key" ON "menu_images"("menu_id", "shift");
