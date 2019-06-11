package com.sentiance;

import android.app.Application;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.app.PendingIntent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.transistorsoft.rnbackgroundgeolocation.RNBackgroundGeolocation;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

// https://github.com/sentiance/react-native-sentiance#android
// import com.reactlibrary.RNSentiancePackage;
import com.sentiance.react.bridge.RNSentiancePackage;
import com.sentiance.sdk.OnInitCallback;
import com.sentiance.sdk.SdkConfig;
import com.sentiance.sdk.Sentiance;

public class MainApplication extends Application implements ReactApplication {
  private static final String SENTIANCE_APP_ID = "***";
  private static final String SENTIANCE_SECRET = "***";

  private final RNSentiancePackage rnSentiancePackage = new RNSentiancePackage();

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNDeviceInfo(),
          new RNBackgroundFetchPackage(),
          new RNBackgroundGeolocation(),
          new AsyncStoragePackage(),
          new RNGestureHandlerPackage(),
          rnSentiancePackage
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();

    initializeAndStartSentianceSDK();

    SoLoader.init(this, /* native exopackage */ false);
  }

  private void initializeAndStartSentianceSDK(){
        //create react context in background so that SDK could be delivered to JS even if app is not running
        if (!mReactNativeHost.getReactInstanceManager().hasStartedCreatingInitialContext())
            mReactNativeHost.getReactInstanceManager().createReactContextInBackground();

        //create notification
        //https://docs.sentiance.com/sdk/getting-started/android-sdk/configuration/sample-notification
        Notification notification = createNotification();

        // Create the config.
        //when user linking is enabled 'SDKMetaUserLink' event will be sent to JS with parameter {installId}
        //after successful linking RNSentiance.metaUserLinkCallback(true) must be called form JS otherwise SDK will keep waiting for user linking to be done
        SdkConfig config = new SdkConfig.Builder(SENTIANCE_APP_ID, SENTIANCE_SECRET, notification)
                //.setOnSdkStatusUpdateHandler(rnSentiancePackage.getOnSdkStatusUpdateHandler())
                //uncomment setMetaUserLinker if user linking is enabled for your app
                //.setMetaUserLinker(rnSentiancePackage.getMetaUserLinker())
                .build();

        // Initialize  and start  Sentiance SDK.
        Sentiance.getInstance(this).init(config, new OnInitCallback() {
            @Override
            public void onInitSuccess() {
                Log.i("⚛︎ Sentiance", "onInitSuccess");
            }

            @Override
            public void onInitFailure(InitIssue issue, @Nullable Throwable throwable) {
                Log.e("⚛︎ Sentiance", issue.toString());
            }
        });
    }

    private Notification createNotification() {
        // PendingIntent that will start your application's MainActivity
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, 0);

        String appName = getApplicationContext().getApplicationInfo().loadLabel(getApplicationContext().getPackageManager()).toString();
        String channelName = appName;
        Integer icon = R.mipmap.notification_icon;
        String channelId = appName;
        String title = "Sentiance active";

        ApplicationInfo info;
        try {
            info = getApplicationContext().getPackageManager().getApplicationInfo(
                    getApplicationContext().getPackageName(), PackageManager.GET_META_DATA);
            title = getStringMetadataFromManifest(info, "com.sentiance.sdk.notification_title", title);
            channelName = getStringMetadataFromManifest(info, "com.sentiance.sdk.notification_channel_name", channelName);
            icon = getIntMetadataFromManifest(info, "com.sentiance.sdk.notification_icon", icon);
            channelId = getStringMetadataFromManifest(info, "com.sentiance.sdk.channel_id", channelId);
        } catch (PackageManager.NameNotFoundException e) {
            Log.e("⚛︎ Sentiance", "ERROR NameNotFoundException");
            e.printStackTrace();
        }

        // On Oreo and above, you must create a notification channel
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(channelId,
                    channelName, NotificationManager.IMPORTANCE_LOW);
            channel.setShowBadge(false);
            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager.createNotificationChannel(channel);
        }

        return new NotificationCompat.Builder(this, channelId)
                .setContentTitle(title)
                .setContentIntent(pendingIntent)
                .setShowWhen(false)
                .setSmallIcon(icon)
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .setColor(0x008AFFFF)
                .build();
    }

    private String getStringMetadataFromManifest(ApplicationInfo info, String name, String defaultValue) {
        Object obj = info.metaData.get(name);
        if (obj instanceof String) {
            return (String) obj;
        } else if (obj instanceof Integer) {
            return getApplicationContext().getString((Integer) obj);
        } else {
            return defaultValue;
        }
    }

    private int getIntMetadataFromManifest(ApplicationInfo info, String name, int defaultValue) {
        Object obj = info.metaData.get(name);
        if (obj instanceof Integer) {
            return (Integer) obj;
        } else {
            return defaultValue;
        }
    }
}
