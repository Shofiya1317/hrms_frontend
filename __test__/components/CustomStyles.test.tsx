import customStyles from "@/components/CustomStyles/CustomStyles";

test("returns styles for selected option", () => {
  const styles = customStyles();
  const selectedStyles = styles.option({}, { isSelected: true, isFocused: false });

  expect(selectedStyles.backgroundColor).toBe("#fba900");
  expect(selectedStyles.color).toBe("#ffffff");
});

test("returns styles for focused option", () => {
  const styles = customStyles();
  const focusedStyles = styles.option({}, { isSelected: false, isFocused: true });

  expect(focusedStyles.backgroundColor).toBe("#e9eaed");
  expect(focusedStyles.color).toBe("#fba900");
});

test("returns default styles for unselected and unfocused option", () => {
  const styles = customStyles();
  const defaultStyles = styles.option({}, { isSelected: false, isFocused: false });

  expect(defaultStyles.backgroundColor).toBe("#ffffff");
  expect(defaultStyles.color).toBe("#64656D");
});

test("returns default styles when called without arguments", () => {
  const styles = customStyles();
  expect(styles).toBeDefined();
  expect(typeof styles.control).toBe("function");
  expect(typeof styles.option).toBe("function");
});

test("indicatorSeparator is hidden by default (showSeparator = false)", () => {
  const styles = customStyles();
  const separatorStyles = styles.indicatorSeparator();
  expect(separatorStyles).toEqual({ display: "none" });
});

test("indicatorSeparator is visible when showSeparator = true", () => {
  const styles = customStyles(true);
  const separatorStyles = styles.indicatorSeparator();
  expect(separatorStyles).toEqual({ backgroundColor: "#E4E7EC", width: "1px" });
});