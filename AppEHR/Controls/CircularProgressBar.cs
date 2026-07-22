using System;
using Microsoft.Maui.Controls;
using Microsoft.Maui.Graphics;

namespace AppEHR.Controls
{
    public class CircularProgressBar : GraphicsView, IDrawable
    {
        public static readonly BindableProperty ProgressProperty =
            BindableProperty.Create(nameof(Progress), typeof(double), typeof(CircularProgressBar), 0.0, propertyChanged: (b, o, n) => ((CircularProgressBar)b).Invalidate());

        public static readonly BindableProperty ProgressColorProperty =
            BindableProperty.Create(nameof(ProgressColor), typeof(Color), typeof(CircularProgressBar), Colors.Orange, propertyChanged: (b, o, n) => ((CircularProgressBar)b).Invalidate());

        public double Progress
        {
            get => (double)GetValue(ProgressProperty);
            set => SetValue(ProgressProperty, value);
        }

        public Color ProgressColor
        {
            get => (Color)GetValue(ProgressColorProperty);
            set => SetValue(ProgressColorProperty, value);
        }

        public CircularProgressBar()
        {
            Drawable = this;
            HeightRequest = 70;
            WidthRequest = 70;
        }

        public void Draw(ICanvas canvas, RectF dirtyRect)
        {
            canvas.Antialias = true;

            float strokeWidth = 6;
            float radius = Math.Min(dirtyRect.Width, dirtyRect.Height) / 2 - strokeWidth;
            PointF center = new PointF(dirtyRect.Width / 2, dirtyRect.Height / 2);

            // Círculo de fondo (sutil según el tema)
            canvas.StrokeColor = (Application.Current?.RequestedTheme == AppTheme.Dark) 
                ? Colors.DimGray.WithAlpha(0.3f) 
                : Colors.LightGray.WithAlpha(0.4f);
            canvas.StrokeSize = strokeWidth;
            canvas.DrawCircle(center.X, center.Y, radius);

            // Arco de progreso
            float progressVal = (float)Math.Clamp(Progress, 0.0, 1.0);
            if (progressVal > 0)
            {
                canvas.StrokeColor = ProgressColor;
                canvas.StrokeSize = strokeWidth;
                canvas.StrokeLineCap = LineCap.Round;
                
                float sweepAngle = progressVal * 360f;
                // Dibujar el arco. En MAUI el startAngle 270 es arriba (12 en punto) y endAngle es 270 + sweepAngle
                canvas.DrawArc(center.X - radius, center.Y - radius, radius * 2, radius * 2, 270, 270 + sweepAngle, true, false);
            }
        }
    }
}
