export interface LoggerOptions {
  delimiter?: string;
  wrapStart?: string;
  wrapEnd?: string;
  prefix?: string;
}

// CSS properties that work in console.log with %c
export interface ConsoleStyle {
  color?: string;
  background?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  fontFamily?: string;
  fontVariant?: string;
  textDecoration?: string;
  textShadow?: string;
  textTransform?: string;
  lineHeight?: string | number;
  padding?: string;
  border?: string;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
}

export type LoggerFunction = {
  (value?: any): LoggerFunction;
  error: (...args: any[]) => LoggerFunction;
  warn: (...args: any[]) => LoggerFunction;
  log: (...args: any[]) => LoggerFunction;
  s: (style: ConsoleStyle | string) => LoggerFunction;
  gs: (style: ConsoleStyle | string) => LoggerFunction;
  cs: () => LoggerFunction;
};

const STYLE_RESET = "\x1B[0m";

function styleObjectToString(style: ConsoleStyle | string): string {
  if (typeof style === "string") {
    return style;
  }

  const kebabCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

  return Object.entries(style)
    .map(([key, value]) => `${kebabCase(key)}: ${value}`)
    .join("; ");
}

export function createLogger(options: LoggerOptions = {}): LoggerFunction {
  const {
    delimiter = " ",
    wrapStart = "[",
    wrapEnd = "]",
    prefix = "",
  } = options;

  const performLog = (logMethod: "log" | "error" | "warn", values: any[]) => {
    const pathParts: string[] = [];
    const dataParts: any[] = [];
    const styleParts: string[] = [];

    for (const v of values) {
      if (typeof v === "string") {
        pathParts.push(v);
      } else if (v && typeof v === "object" && "__style" in v) {
        styleParts.push(v.__style);
      } else {
        dataParts.push(v);
      }
    }

    const pathString = pathParts.join(delimiter);
    const formattedPath = `${wrapStart}${prefix}${pathString}${STYLE_RESET}${wrapEnd}`;

    const allParts = [...styleParts, ...dataParts];

    if (allParts.length > 0) {
      console[logMethod](formattedPath, ...allParts);
    } else {
      console[logMethod](formattedPath);
    }
  };

  function customLogger(values: any[]): LoggerFunction {
    const logFn: any = (value?: any) => {
      const newValues = [...values, value];
      return customLogger(newValues);
    };

    logFn.error = (...args: any[]) => {
      const newValues = [...values, ...args];
      performLog("error", newValues);
      return customLogger(newValues);
    };

    logFn.warn = (...args: any[]) => {
      const newValues = [...values, ...args];
      performLog("warn", newValues);
      return customLogger(newValues);
    };

    logFn.log = (...args: any[]) => {
      const newValues = [...values, ...args];
      performLog("log", newValues);
      return customLogger(newValues);
    };

    logFn.s = (style: ConsoleStyle | string) => {
      const lastValue = values.at(-1);

      if (typeof lastValue === "string") {
        const styleString = styleObjectToString(style);
        const newValues = [
          ...values.slice(0, values.length - 1),
          `%c${lastValue}`,
          { __style: styleString },
          `${STYLE_RESET}`,
        ];
        return customLogger(newValues);
      }

      return customLogger(values);
    };
    logFn.gs = (style: ConsoleStyle | string) => {
      const lastValue = values.at(-1);

      if (typeof lastValue === "string") {
        const styleString = styleObjectToString(style);
        const newValues = [
          ...values.slice(0, values.length - 1),
          `${lastValue}%c`,
          { __style: styleString },
        ];
        return customLogger(newValues);
      }

      return customLogger(values);
    };

    logFn.cs = () => {
      const lastValue = values.at(-1);
      if (typeof lastValue === "string") {
        const newValues = [
          ...values.slice(0, values.length - 1),
          `${lastValue}%c`,
          { __style: STYLE_RESET },
        ];
        return customLogger(newValues);
      }
      if (
        lastValue &&
        typeof lastValue === "object" &&
        Object.hasOwn(lastValue, "__style")
      ) {
        const newValues = [
          ...values.slice(0, values.length - 1),
          { __style: STYLE_RESET },
        ];
        return customLogger(newValues);
      }

      return customLogger(values);
    };

    return logFn;
  }

  return customLogger([]);
}

const logger = createLogger({ prefix: "Registry" });

const blue = logger('blue').s({ color: 'blue' }).log('normal')

const allRed = logger('Path:').gs({ color: 'red', fontWeight: 'bold' })('registry/lib/logger.ts').log('still red');

const reseted = allRed.cs().log('back to normal');