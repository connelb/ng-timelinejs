
export class TimelineModel {
  
    public getNewSelection(
      path: Array<any>, 
      currentEvents: Array<any>, 
      selectedIndex: number, 
      className:string
    ): Array<any> {
      
      if (['tl-headline', 'tl-timemarker-content', 'tl-icon-image'].indexOf(className) !== -1) {
        let txt = this.getTxt(path[0].innerText);
        return [
          currentEvents.find(x => x.unique_id.trim() == txt),
          currentEvents.findIndex(x => x.unique_id.trim() == txt)
        ];
      }
  
      //click in previousButton
      if (['tl-icon-goback','tl-menubar-button'].indexOf(className) !== -1){
        return [currentEvents[0],0];
      }
  
      //click in timeline arrows
      let index = this.findSelectedIndex(path, currentEvents, selectedIndex);
      if (index === null) {return null;}
      return [currentEvents[index],index];
    }
    
        private getTxt(text:string):string{
          let txt = text.trim().toLowerCase().replace(new RegExp(' ', 'g'), '-');
          return txt.replace(/[^\w\-\s]/gi, '');
        }
  
        private findSelectedIndex(path: Array<any>, currentEvents: Array<any>, selectedIndex: number): number {
          let index = null;
          for (let i in path) {
            console.log(path[i].className );
            if (path[i].className == "tl-slidenav-next") {
            console.log('next');
              index = selectedIndex + 1;
              if (index > currentEvents.length - 1) {
                index = currentEvents.length - 1;
              }
              break;
            }
  
            if (path[i].className == "tl-slidenav-previous") {
              index = selectedIndex - 1;
              if (index < 0) {
                index = 0;
              }
              break;
            }
          }
          return index;
        }
  }