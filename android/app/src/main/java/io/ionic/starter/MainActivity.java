package infoleader.caisse; // Gardez votre package actuel

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

// 1. VOICI LE BON IMPORT (basé sur vos logs)
import com.leeskies.capacitor.usbserialplugin.UsbSerial; 

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Aucune ligne registerPlugin n'est nécessaire ici !
    }
}