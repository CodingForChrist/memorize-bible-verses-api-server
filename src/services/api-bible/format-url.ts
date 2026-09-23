type FormatSearchParametersInput = {
  [key: string]: string | string[] | number | boolean | undefined;
};

export function formatSearchParameters(
  parameters: FormatSearchParametersInput,
) {
  const approvedParameters: { [key: string]: string } = {};

  for (const [key, value] of Object.entries(parameters)) {
    if (value === undefined) {
      continue;
    }

    const kebabCaseKey = camelCaseToKebabCase(key);
    approvedParameters[kebabCaseKey] = String(value);
  }

  const urlSearchParameters = new URLSearchParams(approvedParameters);
  return urlSearchParameters;
}

function camelCaseToKebabCase(camelCaseString: string) {
  return [...camelCaseString]
    .map((letter, id) => {
      return letter.toUpperCase() === letter
        ? `${id === 0 ? "" : "-"}${letter.toLowerCase()}`
        : letter;
    })
    .join("");
}
