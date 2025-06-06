package ua.nure.apz.components;

import android.content.Context;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;

import ua.nure.apz.R;

public class AnalyticsCard extends CardView {
    private TextView nameView;

    private AnalyticsText enableCountView;
    private AnalyticsText totalTimeView;
    private AnalyticsText averageTimeView;
    private AnalyticsText electricityConsumptionView;
    private AnalyticsText electricityPriceView;

    public AnalyticsCard(@NonNull Context context) {
        super(context);
        createLayout(context);
    }

    public AnalyticsCard(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        createLayout(context);
    }

    public AnalyticsCard(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        createLayout(context);
    }

    private void createLayout(Context context) {
        LayoutParams params = (LayoutParams) getLayoutParams();
        if(params == null)
            params = new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
        params.width = LayoutParams.MATCH_PARENT;
        params.height = LayoutParams.WRAP_CONTENT;
        params.bottomMargin = 16;
        setLayoutParams(params);
        setRadius(12);
        setCardElevation(6);

        LinearLayout cardLayout = new LinearLayout(context);
        LinearLayout.LayoutParams linearParams = (LinearLayout.LayoutParams) cardLayout.getLayoutParams();
        if(linearParams == null)
            linearParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        linearParams.width = LayoutParams.MATCH_PARENT;
        linearParams.height = LayoutParams.WRAP_CONTENT;
        cardLayout.setLayoutParams(params);
        cardLayout.setOrientation(LinearLayout.VERTICAL);
        cardLayout.setPadding(16, 16, 16, 16);
        addView(cardLayout);

        nameView = new TextView(context);
        linearParams = (LinearLayout.LayoutParams) nameView.getLayoutParams();
        if(linearParams == null)
            linearParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        linearParams.width = LayoutParams.MATCH_PARENT;
        linearParams.height = LayoutParams.WRAP_CONTENT;
        nameView.setLayoutParams(params);
        nameView.setTextSize(18);
        nameView.setTypeface(Typeface.DEFAULT_BOLD);
        nameView.setPadding(0, 0, 0, 8);
        cardLayout.addView(nameView);

        enableCountView = new AnalyticsText(context);
        enableCountView.setDescription(context.getString(R.string.enable_count));
        cardLayout.addView(enableCountView);

        totalTimeView = new AnalyticsText(context);
        totalTimeView.setDescription(context.getString(R.string.total_time));
        cardLayout.addView(totalTimeView);

        averageTimeView = new AnalyticsText(context);
        averageTimeView.setDescription(context.getString(R.string.average_time));
        cardLayout.addView(averageTimeView);

        electricityConsumptionView = new AnalyticsText(context);
        electricityConsumptionView.setDescription(context.getString(R.string.electricity_consumption));
        cardLayout.addView(electricityConsumptionView);

        electricityPriceView = new AnalyticsText(context);
        electricityPriceView.setDescription(context.getString(R.string.electricity_price_a));
        cardLayout.addView(electricityPriceView);
    }

    public void setName(String name) {
        nameView.setText(name);
    }

    public void setEnableCount(String value) {
        enableCountView.setValue(value);
    }

    public void setTotalTime(String value) {
        totalTimeView.setValue(value);
    }

    public void setAverageTime(String value) {
        averageTimeView.setValue(value);
    }

    public void setElectricityConsumption(String value) {
        electricityConsumptionView.setValue(value);
    }

    public void setElectricityPrice(String value) {
        electricityPriceView.setValue(value);
    }

}
