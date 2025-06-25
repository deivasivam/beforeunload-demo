// import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit, OnDestroy {

//   private logApiUrl = 'http://localhost:3000/signin/logout/';

//   // To store the bound event handler for proper removal
//   private boundHandleUnload: () => void;

//   constructor() {
//     // Bind the unload handler method to the current instance
//     this.boundHandleUnload = this.handleUnload.bind(this);
//   }

//   ngOnInit(): void {
//     const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
//     console.log(navEntries);
//     // Add the 'unload' event listener when the component is initialized
//     window.addEventListener('unload', this.boundHandleUnload);
//   }

//   ngOnDestroy(): void {
//     // Remove the 'unload' event listener when the component is destroyed
//     window.removeEventListener('unload', this.boundHandleUnload);
//   }

//   @HostListener('window:beforeunload', ['$event'])
//   handleBeforeUnload(event: BeforeUnloadEvent): void {
//     // Set a short-lived flag indicating a potential refresh/navigation
//     sessionStorage.setItem('isRefresh', 'true');
//     // Prevent the default action (navigation) to trigger the browser's confirmation dialog
//     event.preventDefault();
//     event.returnValue = ''; // Required for some browsers to show the default confirmation dialog
//   }

//   /**
//    * Called when the page is unloading, after the user confirms leaving or if no prompt was shown.
//    */
//   private handleUnload(): void {
//     // Detect if it's a reload
//     const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
//     console.log(navEntries);
//     const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';

//     if (!isReload) {
//       console.log('Page is closing (not a refresh). Sending logout beacon.');
//       this.sendLogoutByHttp('tab-or-window-close')
//         .catch(err => {
//           console.warn('Error sending logout beacon on unload:', err);
//         });
//     } else {
//       console.log('Page refresh detected. Not sending logout.');
//     }
//   }


//   /**
//    * Sends a logout beacon using navigator.sendBeacon.
//    * @param reason - Reason for the logout beacon.
//    */
//   private sendLogoutBeacon(reason: string): void {
//     const logData = {
//       timestamp: new Date().toISOString(),
//       reason: reason
//     };
//     const blob = new Blob([JSON.stringify(logData)], { type: 'application/json' });

//     if (navigator.sendBeacon) {
//       navigator.sendBeacon(this.logApiUrl, blob);
//       console.log(`Logout beacon sent (navigator.sendBeacon). Reason: ${reason}`);
//     } else {
//       console.warn('navigator.sendBeacon is not supported in this browser. Log data not sent via sendBeacon.');
//     }
//   }

//   /**
//    * Sends log data using the fetch API with keepalive.
//    * @param reason - A string indicating the reason for the logout.
//    */
//   private async sendLogoutByHttp(reason: string): Promise<void> {
//     const logData = {
//       timestamp: new Date().toISOString(),
//       reason: reason
//     };

//     try {
//       const response = await fetch(this.logApiUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(logData),
//         keepalive: true // Crucial for requests during page unload
//       });

//       if (response.ok) {
//         console.log(`Logout data sent via fetch. Reason: ${reason}, Status: ${response.status}`);
//       } else {
//         console.warn(`Failed to send logout data via fetch. Reason: ${reason}, Status: ${response.status}`);
//       }
//     } catch (error) {
//       console.error(`Error sending logout data via fetch. Reason: ${reason}:`, error);
//       // Re-throwing allows callers like triggerManualLogout to handle it if needed
//       throw error;
//     }
//   }

//   /**
//    * Public method for manual logout (e.g., via a button).
//    */
//   public triggerManualLogout(): void {
//     console.log('Manual logout initiated by user.');
//     // Using sendLogoutBeacon2 for consistency and better error handling capabilities
//     this.sendLogoutByHttp('manual-button-logout')
//       .then(() => {
//         console.log('Manual logout beacon request successfully initiated (fetch).');
//         // Add any post-logout actions here, like redirecting the user
//         // alert('You have been logged out.');
//       })
//       .catch(error => {
//         console.error('Failed to send manual logout beacon (fetch):', error);
//         // alert('There was an issue with the logout process. Please try again.');
//       });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { SessionTrackerService } from 'src/service/session-tracker-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  private logApiUrl = 'http://localhost:3000/signin/';
  isLoggedIn = false;

  constructor(private sessionTracker: SessionTrackerService) { }

  ngOnInit(): void {
    this.sessionTracker.initSessionTracking();
    if (localStorage.getItem('authToken')) {
      this.isLoggedIn = true;
    }
  }


  public triggerManualApi(endPoint: string): void {

    this.sendByHttp(`manual-button-logout${endPoint}`, endPoint)
      .then(() => {
        console.log(`Manual ${endPoint} beacon request successfully initiated (fetch).`);
        // Add any post-logout actions here, like redirecting the user
        // alert('You have been logged out.');
      })
      .catch(error => {
        console.error('Failed to send manual logout beacon (fetch):', error);
        // alert('There was an issue with the logout process. Please try again.');
      });

    if (endPoint === 'login/') {
      localStorage.setItem('authToken', Math.random().toString(36).substring(2, 15));
      this.isLoggedIn = true;
    }
    if (endPoint === 'logout/') {
      localStorage.removeItem('authToken');
      this.isLoggedIn = false;
    }

  }

  private async sendByHttp(reason: string, endPoint: string): Promise<void> {
    const logData = {
      timestamp: new Date().toISOString(),
      reason: reason
    };

    try {
      const response = await fetch(this.logApiUrl + endPoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
        keepalive: true // Crucial for requests during page unload
      });

      if (response.ok) {
        console.log(`Logout data sent via fetch. Reason: ${reason}, Status: ${response.status}`);
      } else {
        console.warn(`Failed to send logout data via fetch. Reason: ${reason}, Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error sending logout data via fetch. Reason: ${reason}:`, error);
      // Re-throwing allows callers like triggerManualLogout to handle it if needed
      throw error;
    }
  }

}
