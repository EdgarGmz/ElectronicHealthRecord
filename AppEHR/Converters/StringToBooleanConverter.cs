using System;
using System.Globalization;
using Microsoft.Maui.Controls;

namespace AppEHR.Converters
{
    public class StringToBooleanConverter : IValueConverter
    {
        private static readonly InverseBooleanConverter _inverseConverter = new InverseBooleanConverter();
        private static readonly DurationToIndexConverter _durationConverter = new DurationToIndexConverter();
        private static readonly TypeToIndexConverter _typeConverter = new TypeToIndexConverter();
        private static readonly PercentToProgressConverter _percentConverter = new PercentToProgressConverter();

        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            string? paramStr = parameter?.ToString();

            if (paramStr == "invert")
            {
                return _inverseConverter.Convert(value, targetType, parameter, culture);
            }
            if (paramStr == "DurationToIndex")
            {
                return _durationConverter.Convert(value, targetType, parameter, culture);
            }
            if (paramStr == "TypeToIndex")
            {
                return _typeConverter.Convert(value, targetType, parameter, culture);
            }
            if (paramStr == "ProgressBar")
            {
                return _percentConverter.Convert(value, targetType, parameter, culture);
            }
            if (paramStr == "⚠️")
            {
                if (value is bool b && b)
                {
                    return "⚠️";
                }
                return string.Empty;
            }

            if (value is string str)
            {
                return !string.IsNullOrWhiteSpace(str);
            }
            if (value is bool booleanVal)
            {
                return booleanVal;
            }
            return value != null;
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            string? paramStr = parameter?.ToString();

            if (paramStr == "invert")
            {
                return _inverseConverter.ConvertBack(value, targetType, parameter, culture);
            }
            if (paramStr == "DurationToIndex")
            {
                return _durationConverter.ConvertBack(value, targetType, parameter, culture);
            }
            if (paramStr == "TypeToIndex")
            {
                return _typeConverter.ConvertBack(value, targetType, parameter, culture);
            }
            if (paramStr == "ProgressBar")
            {
                return _percentConverter.ConvertBack(value, targetType, parameter, culture);
            }

            throw new NotImplementedException("ConvertBack is only supported with routing parameters.");
        }
    }


    public class InverseBooleanConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is bool b)
            {
                return !b;
            }
            return true;
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is bool b)
            {
                return !b;
            }
            return false;
        }
    }

    public class DurationToIndexConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is int duration)
            {
                return duration switch
                {
                    40 => 0,
                    50 => 1,
                    60 => 2,
                    90 => 3,
                    _ => 0
                };
            }
            return 0;
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is int index)
            {
                return index switch
                {
                    0 => 40,
                    1 => 50,
                    2 => 60,
                    3 => 90,
                    _ => 40
                };
            }
            return 40;
        }
    }

    public class TypeToIndexConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is string type)
            {
                return type switch
                {
                    "follow_up" => 0,
                    "initial_consultation" => 1,
                    "emergency" => 2,
                    "routine" => 3,
                    _ => 0
                };
            }
            return 0;
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is int index)
            {
                return index switch
                {
                    0 => "follow_up",
                    1 => "initial_consultation",
                    2 => "emergency",
                    3 => "routine",
                    _ => "follow_up"
                };
            }
            return "follow_up";
        }
    }

    public class PercentToProgressConverter : IValueConverter
    {
        public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is double percent)
            {
                return percent / 100.0;
            }
            return 0.0;
        }

        public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        {
            if (value is double progress)
            {
                return progress * 100.0;
            }
            return 0.0;
        }
    }
}
