import {
  Button,
  Card,
  Chip,
  IconButton,
  Row,
  Screen,
  SectionHeader,
  Stack,
  Text,
  useTheme,
} from "@factory/design-system";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { Field, RecipeArt, Stepper } from "@/components/ui";
import { repos } from "@/database";
import { ingredientName, isCustomKey, keyForName } from "@/domain/ingredients";
import { parseQuantity } from "@/domain/quantity";
import { parseIngredientLine } from "@/domain/recipeImport";
import { canCreateRecipe, validateUserRecipe } from "@/domain/recipes";
import {
  ART_COLORS,
  DIFFICULTIES,
  RECIPE_CATEGORIES,
  RECIPE_TAGS,
  type ArtColor,
  type Difficulty,
  type RecipeCategory,
  type UnitId,
} from "@/domain/types";
import { unitsForPicker } from "@/domain/units";
import { useLang } from "@/hooks/useLang";
import { track } from "@/services/analytics";
import { useImportDraft } from "@/store/draft";
import { dataChanged, useIsPremium } from "@/store/session";

const EMOJIS = [
  "🍲",
  "🥗",
  "🍝",
  "🍛",
  "🥘",
  "🍜",
  "🌮",
  "🥪",
  "🍕",
  "🍔",
  "🥞",
  "🍳",
  "🥣",
  "🍗",
  "🐟",
  "🥩",
  "🥦",
  "🍅",
  "🥕",
  "🍰",
  "🍪",
  "🍎",
  "🥤",
  "🍞",
];

interface IngRow {
  uid: string;
  name: string;
  qty: string;
  unit: UnitId;
  note: string;
  key?: string;
}
interface StepRow {
  uid: string;
  text: string;
  timer: string;
}

let uidSeq = 0;
const uid = () => `r${++uidSeq}`;

export default function RecipeEditor() {
  const { t, lng, system } = useLang();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isPremium = useIsPremium();
  const imported = useImportDraft((s) => s.draft);
  const [loaded, setLoaded] = useState(!id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🍲");
  const [color, setColor] = useState<ArtColor>("tomato");
  const [servings, setServings] = useState(2);
  const [prep, setPrep] = useState("15");
  const [cook, setCook] = useState("20");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [categories, setCategories] = useState<RecipeCategory[]>(["dinner"]);
  const [tags, setTags] = useState<string[]>([]);
  const [ings, setIngs] = useState<IngRow[]>([]);
  const [steps, setSteps] = useState<StepRow[]>([
    { uid: uid(), text: "", timer: "" },
  ]);
  const [quickLine, setQuickLine] = useState("");
  const [unitPicker, setUnitPicker] = useState<string | null>(null);
  const [nutrition, setNutrition] = useState({
    kcal: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Load an existing recipe, or an imported draft.
  useEffect(() => {
    let cancelled = false;
    if (id) {
      void repos()
        .recipes.get(id)
        .then((r) => {
          if (!r || cancelled) return;
          setTitle(r.title);
          setDescription(r.description);
          setEmoji(r.emoji);
          setColor(r.color);
          setServings(r.servings);
          setPrep(String(r.prepMinutes));
          setCook(String(r.cookMinutes));
          setDifficulty(r.difficulty);
          setCategories(r.categories);
          setTags(r.tags);
          setIngs(
            r.ingredients.map((i) => ({
              uid: uid(),
              key: i.key,
              name: ingredientName(i.key, lng, i.name),
              qty: i.quantity === null ? "" : qtyStr(i.quantity),
              unit: i.unit,
              note: i.note ?? "",
            })),
          );
          setSteps(
            r.steps.map((s) => ({
              uid: uid(),
              text: s.text,
              timer: s.timerMinutes ? String(s.timerMinutes) : "",
            })),
          );
          if (r.nutrition)
            setNutrition({
              kcal: str(r.nutrition.kcal),
              protein: str(r.nutrition.protein),
              carbs: str(r.nutrition.carbs),
              fat: str(r.nutrition.fat),
            });
          setLoaded(true);
        });
    } else if (imported) {
      // Applied asynchronously, like the database load above (no cascading render).
      void Promise.resolve().then(() => {
        if (cancelled) return;
        setTitle(imported.title);
        setDescription(imported.description);
        if (imported.servings) setServings(imported.servings);
        if (imported.prepMinutes !== null)
          setPrep(String(imported.prepMinutes));
        if (imported.cookMinutes !== null)
          setCook(String(imported.cookMinutes));
        setIngs(
          imported.ingredients.map((i) => ({
            uid: uid(),
            key: i.key,
            name: ingredientName(i.key, lng, i.name),
            qty: i.quantity === null ? "" : qtyStr(i.quantity),
            unit: i.unit,
            note: i.note ?? "",
          })),
        );
        if (imported.steps.length)
          setSteps(
            imported.steps.map((s) => ({
              uid: uid(),
              text: s.text,
              timer: s.timerMinutes ? String(s.timerMinutes) : "",
            })),
          );
        useImportDraft.getState().set(null);
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, [id]);

  const addQuick = () => {
    const parsed = parseIngredientLine(quickLine);
    if (!parsed) return;
    setIngs((list) => [
      ...list,
      {
        uid: uid(),
        key: parsed.key,
        name: ingredientName(parsed.key, lng, parsed.name),
        qty: parsed.quantity === null ? "" : qtyStr(parsed.quantity),
        unit: parsed.unit,
        note: parsed.note ?? "",
      },
    ]);
    setQuickLine("");
  };

  const updateIng = (u: string, patch: Partial<IngRow>) =>
    setIngs((list) =>
      list.map((i) =>
        i.uid === u
          ? {
              ...i,
              ...patch,
              ...(patch.name !== undefined ? { key: undefined } : {}),
            }
          : i,
      ),
    );
  const updateStep = (u: string, patch: Partial<StepRow>) =>
    setSteps((list) => list.map((s) => (s.uid === u ? { ...s, ...patch } : s)));
  const toggle = <T,>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const save = async () => {
    const ingredients = ings
      .filter((i) => i.name.trim())
      .map((i) => {
        const key = i.key ?? keyForName(i.name);
        const quantity = i.unit === "to_taste" ? null : parseQuantity(i.qty);
        return {
          key,
          ...(isCustomKey(key) ? { name: i.name.trim() } : {}),
          quantity,
          unit: i.unit,
          ...(i.note.trim() ? { note: i.note.trim() } : {}),
        };
      });
    const input = {
      title,
      description,
      emoji,
      color,
      servings,
      prepMinutes: Number(prep) || 0,
      cookMinutes: Number(cook) || 0,
      difficulty,
      categories: categories.length
        ? categories
        : (["dinner"] as RecipeCategory[]),
      tags,
      ingredients,
      steps: steps
        .filter((s) => s.text.trim())
        .map((s) => ({
          text: s.text.trim(),
          ...(Number(s.timer) > 0
            ? { timerMinutes: Math.min(480, Math.round(Number(s.timer))) }
            : {}),
        })),
      nutrition: nutrition.kcal.trim()
        ? {
            kcal: num(nutrition.kcal),
            protein: num(nutrition.protein),
            carbs: num(nutrition.carbs),
            fat: num(nutrition.fat),
          }
        : null,
    };
    const errs = validateUserRecipe(input);
    setErrors(errs);
    if (errs.length) return;
    setSaving(true);
    try {
      if (id) await repos().recipes.update(id, input);
      else {
        if (!canCreateRecipe(await repos().recipes.count(), isPremium)) {
          router.push({
            pathname: "/paywall",
            params: { source: "recipe_limit" },
          });
          return;
        }
        const newId = await repos().recipes.create(input);
        track("recipe_created", { source: imported ? "import" : "manual" });
        dataChanged();
        router.replace({ pathname: "/recipe/[id]", params: { id: newId } });
        return;
      }
      dataChanged();
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const discard = () =>
    Alert.alert(t("editor.discardTitle"), t("editor.discardBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("editor.discard"),
        style: "destructive",
        onPress: () => router.back(),
      },
    ]);

  if (!loaded) return <Screen edges={[]}>{null}</Screen>;
  const units = unitsForPicker(system);

  return (
    <Screen
      edges={[]}
      footer={
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <Button
              label={t("common.cancel")}
              variant="secondary"
              onPress={discard}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button
              label={t("common.save")}
              icon="checkmark"
              onPress={save}
              loading={saving}
              testID="editor-save"
            />
          </View>
        </Row>
      }
    >
      {errors.length ? (
        <Card tone="alt" testID="editor-errors">
          {errors.map((e) => (
            <Text key={e} variant="bodySmall" tone="danger">
              • {t(e)}
            </Text>
          ))}
        </Card>
      ) : null}

      <Row gap={3}>
        <RecipeArt emoji={emoji} color={color} size={72} />
        <View style={{ flex: 1 }}>
          <Field
            label={t("editor.name")}
            value={title}
            onChangeText={setTitle}
            placeholder={t("editor.namePlaceholder")}
            maxLength={80}
            testID="editor-title"
          />
        </View>
      </Row>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6 }}
      >
        {EMOJIS.map((e) => (
          <Pressable
            key={e}
            onPress={() => setEmoji(e)}
            accessibilityRole="button"
            accessibilityLabel={e}
            accessibilityState={{ selected: emoji === e }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                emoji === e ? theme.colors.primarySoft : theme.colors.surface,
            }}
          >
            <Text style={{ fontSize: 24 }} maxFontSizeMultiplier={1}>
              {e}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Row gap={2} wrap>
        {ART_COLORS.map((c) => (
          <Chip
            key={c}
            label={t(`colors.${c}`)}
            selected={color === c}
            onPress={() => setColor(c)}
          />
        ))}
      </Row>
      <Field
        label={t("editor.description")}
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={300}
      />

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Text variant="subheading">{t("recipe.servings")}</Text>
          <Stepper
            value={servings}
            onChange={setServings}
            min={1}
            max={50}
            label={t("recipe.servings")}
          />
        </Row>
        <Row gap={3}>
          <Field
            label={t("editor.prepMinutes")}
            value={prep}
            onChangeText={setPrep}
            keyboardType="number-pad"
            style={{ flex: 1 }}
            maxLength={4}
          />
          <Field
            label={t("editor.cookMinutes")}
            value={cook}
            onChangeText={setCook}
            keyboardType="number-pad"
            style={{ flex: 1 }}
            maxLength={4}
          />
        </Row>
        <Row gap={2} wrap>
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              label={t(`difficulty.${d}`)}
              selected={difficulty === d}
              onPress={() => setDifficulty(d)}
            />
          ))}
        </Row>
      </Card>

      <SectionHeader title={t("editor.categories")} />
      <Row gap={2} wrap>
        {RECIPE_CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={t(`categories.${c}`)}
            selected={categories.includes(c)}
            onPress={() => setCategories(toggle(categories, c))}
          />
        ))}
      </Row>
      <Text variant="label" tone="muted">
        {t("editor.tags")}
      </Text>
      <Row gap={2} wrap>
        {RECIPE_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={t(`tags.${tag}`)}
            selected={tags.includes(tag)}
            onPress={() => setTags(toggle(tags, tag))}
          />
        ))}
      </Row>

      <SectionHeader title={t("recipe.ingredients")} />
      <Card>
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <Field
              value={quickLine}
              onChangeText={setQuickLine}
              placeholder={t("editor.quickAddPlaceholder")}
              testID="editor-quick-add"
            />
          </View>
          <IconButton
            icon="add-circle"
            tone="primary"
            label={t("editor.addIngredient")}
            onPress={addQuick}
          />
        </Row>
        <Text variant="caption" tone="subtle">
          {t("editor.quickAddHint")}
        </Text>
        {ings.map((i) => (
          <Stack
            key={i.uid}
            gap={2}
            style={{
              paddingVertical: 6,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
            }}
          >
            <Row gap={2}>
              <Field
                value={i.qty}
                onChangeText={(v) => updateIng(i.uid, { qty: v })}
                placeholder={t("editor.qty")}
                keyboardType="decimal-pad"
                style={{ width: 76 }}
                maxLength={8}
              />
              <Chip
                label={t(`unitsShort.${i.unit}`)}
                selected={unitPicker === i.uid}
                onPress={() =>
                  setUnitPicker(unitPicker === i.uid ? null : i.uid)
                }
              />
              <View style={{ flex: 1 }}>
                <Field
                  value={i.name}
                  onChangeText={(v) => updateIng(i.uid, { name: v })}
                  placeholder={t("editor.ingredientName")}
                  maxLength={60}
                />
              </View>
              <IconButton
                icon="close"
                label={t("common.remove")}
                onPress={() => setIngs((l) => l.filter((x) => x.uid !== i.uid))}
              />
            </Row>
            {unitPicker === i.uid ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6 }}
              >
                {units.map((u) => (
                  <Chip
                    key={u}
                    label={t(`unitsShort.${u}`)}
                    selected={i.unit === u}
                    onPress={() => {
                      setIngs((list) =>
                        list.map((x) =>
                          x.uid === i.uid ? { ...x, unit: u } : x,
                        ),
                      );
                      setUnitPicker(null);
                    }}
                  />
                ))}
              </ScrollView>
            ) : null}
            <Field
              value={i.note}
              onChangeText={(v) =>
                setIngs((list) =>
                  list.map((x) => (x.uid === i.uid ? { ...x, note: v } : x)),
                )
              }
              placeholder={t("editor.notePlaceholder")}
              maxLength={60}
            />
          </Stack>
        ))}
        <Button
          label={t("editor.addEmptyIngredient")}
          variant="ghost"
          size="md"
          icon="add"
          onPress={() =>
            setIngs((l) => [
              ...l,
              { uid: uid(), name: "", qty: "", unit: "pc", note: "" },
            ])
          }
        />
      </Card>

      <SectionHeader title={t("recipe.steps")} />
      {steps.map((s, idx) => (
        <Card key={s.uid}>
          <Row style={{ justifyContent: "space-between" }}>
            <Text variant="label" tone="primary">
              {t("cook.stepOf", { current: idx + 1, total: steps.length })}
            </Text>
            <IconButton
              icon="close"
              label={t("common.remove")}
              onPress={() =>
                setSteps((l) =>
                  l.length > 1 ? l.filter((x) => x.uid !== s.uid) : l,
                )
              }
            />
          </Row>
          <Field
            value={s.text}
            onChangeText={(v) => updateStep(s.uid, { text: v })}
            multiline
            placeholder={t("editor.stepPlaceholder")}
            maxLength={600}
          />
          <Field
            label={t("editor.timer")}
            value={s.timer}
            onChangeText={(v) => updateStep(s.uid, { timer: v })}
            keyboardType="number-pad"
            maxLength={3}
            style={{ width: 160 }}
          />
        </Card>
      ))}
      <Button
        label={t("editor.addStep")}
        variant="secondary"
        icon="add"
        onPress={() =>
          setSteps((l) => [...l, { uid: uid(), text: "", timer: "" }])
        }
      />

      <SectionHeader title={t("editor.nutritionTitle")} />
      <Card>
        <Text variant="bodySmall" tone="muted">
          {t("editor.nutritionHint")}
        </Text>
        <Row gap={2}>
          {(["kcal", "protein", "carbs", "fat"] as const).map((k) => (
            <Field
              key={k}
              label={t(`nutrition.${k}`)}
              value={nutrition[k]}
              onChangeText={(v) => setNutrition((n) => ({ ...n, [k]: v }))}
              keyboardType="decimal-pad"
              style={{ flex: 1 }}
              maxLength={5}
            />
          ))}
        </Row>
      </Card>
    </Screen>
  );
}

function str(n: number | null): string {
  return n === null ? "" : String(n);
}
function num(s: string): number | null {
  const n = parseQuantity(s);
  return n === null ? null : Math.round(n);
}
/** Plain decimal string (no grouping separators) so it parses back exactly. */
function qtyStr(n: number): string {
  return String(Math.round(n * 1000) / 1000);
}
