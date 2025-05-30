package ua.nure.apz.adapters;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import ua.nure.apz.DeviceInfoActivity;
import ua.nure.apz.R;
import ua.nure.apz.api.Device;

public class DeviceAdapter extends RecyclerView.Adapter<DeviceAdapter.DeviceViewHolder> {
    private List<Device> devices;
    private Context context;

    public DeviceAdapter(List<Device> devices, Context context) {
        this.devices = devices;
        this.context = context;
    }

    public void setDevices(List<Device> newDevices) {
        this.devices = newDevices;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public DeviceViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_device, parent, false);
        return new DeviceViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull DeviceViewHolder holder, int position) {
        Device d = devices.get(position);
        holder.name.setText(d.getName());
        holder.status.setText(d.getConfiguration().getEnabledManually() ? "ON" : "OFF");
        holder.price.setText("" + d.getConfiguration().getElectricityPrice());
        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(context, DeviceInfoActivity.class);
            intent.putExtra("deviceId", d.getId());
            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return devices.size();
    }

    public void addDevices(List<Device> newDevices) {
        int start = this.devices.size();
        this.devices.addAll(newDevices);
        notifyItemRangeInserted(start, newDevices.size());
    }

    public void addDevice(int pos, Device newDevice) {
        this.devices.add(pos, newDevice);
        notifyItemRangeInserted(pos, 1);
    }

    public static class DeviceViewHolder extends RecyclerView.ViewHolder {
        TextView name, status, price;

        public DeviceViewHolder(@NonNull View itemView) {
            super(itemView);
            name = itemView.findViewById(R.id.deviceName);
            status = itemView.findViewById(R.id.deviceStatus);
            price = itemView.findViewById(R.id.devicePrice);
        }
    }
}

