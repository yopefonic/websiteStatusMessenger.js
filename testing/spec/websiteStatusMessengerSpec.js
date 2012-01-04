describe("WebsiteStatusMessenger", function() {
    var statusMessenger;

    afterEach(function() {
        var messengerDiv = document.getElementById("system_messages");
        if (messengerDiv != null) {
            document.body.removeChild(messengerDiv);
        }
    });

    describe("constructor", function() {
        describe("creating base DOM elements", function() {
            it("should call the element creation method", function() {
                spyOn(WebsiteStatusMessenger.prototype, 'createBaseElements');
                new WebsiteStatusMessenger();

                expect(WebsiteStatusMessenger.prototype.createBaseElements).toHaveBeenCalled();
            });

            it("should create the DOM element", function() {
                new WebsiteStatusMessenger();
                expect(document.getElementById("system_messages")).not.toBeNull();
            });
        });

        it("bind the close action to the call button", function() {
            spyOn(WebsiteStatusMessenger.prototype, 'setCloseListener');
            new WebsiteStatusMessenger();

            expect(WebsiteStatusMessenger.prototype.setCloseListener).toHaveBeenCalled();
        });

        describe("options without customs", function() {
            it("should have the default options", function() {
                statusMessenger = new WebsiteStatusMessenger();
                expect(statusMessenger.options).toEqual({
                    id: 'system_messages',
                    animationSpeed: 200,
                    messageDelay: 3500,
                    messageBaseClass: 'message',
                    messageCloseText: 'close'
                });
            });
        });

        describe("options with customs", function() {
            it("should change one value of options without affecting the others", function() {
                statusMessenger = new WebsiteStatusMessenger({messageBaseClass: "foobar"});
                expect(statusMessenger.options).toEqual({
                    id: 'system_messages',
                    animationSpeed: 200,
                    messageDelay: 3500,
                    messageBaseClass: 'foobar',
                    messageCloseText: 'close'
                });
            });

            it("should add an option value", function() {
                statusMessenger = new WebsiteStatusMessenger({foo: "bar"});
                expect(statusMessenger.options.foo).toBe('bar');
            });
        });

        describe("default values", function() {
            it("should create default values", function() {
                statusMessenger = new WebsiteStatusMessenger();
                expect(statusMessenger.isAnimating).toBeDefined();
                expect(statusMessenger.isOpened).toBeDefined();
                expect(statusMessenger.currentMessage).toBeDefined();
                expect(statusMessenger.messageCounter).toBeDefined();
                expect(statusMessenger.messageQueue).toBeDefined();
            });
        });
    });

    describe("addMessage", function() {
        beforeEach(function() {
            statusMessenger = new WebsiteStatusMessenger();

            // stubbing nextMessage to return true
            statusMessenger.nextMessage = function() {
                return true;
            };
        });

        describe("when the messages are not animating", function() {
            it("should call the nextMessage function", function() {
                spyOn(statusMessenger, 'nextMessage');
                statusMessenger.addMessage("foo", "bar");

                expect(statusMessenger.nextMessage).toHaveBeenCalled();
            });
        });

        describe("when the messages are animating", function() {
            beforeEach(function() {
                statusMessenger.isAnimating = true;
            });

            it("should not call the nextMessage function", function() {
                spyOn(statusMessenger, 'nextMessage');
                statusMessenger.addMessage("foo", "bar");

                expect(statusMessenger.nextMessage).not.toHaveBeenCalled();
            });
        });

        describe("message queue", function() {
            it("should create a new message in the queue", function() {
                expect(statusMessenger.messageQueue.length).toEqual(0);

                statusMessenger.addMessage("foo", "bar");

                expect(statusMessenger.messageQueue.length).toEqual(1);
            });

            it("should stack messages into the queue", function() {
                statusMessenger.addMessage("foo", "bar");
                statusMessenger.addMessage("albert", "einstein");

                expect(statusMessenger.messageQueue[0]).toEqual({nr: 0, text: "foo", state: "bar"});
                expect(statusMessenger.messageQueue[1]).toEqual({nr: 1, text: "albert", state: "einstein"});
                expect(statusMessenger.messageQueue.length).toEqual(2);
            });
        });
    });

    describe("nextMessage", function() {
        beforeEach(function() {
            statusMessenger = new WebsiteStatusMessenger({messageDelay: 50, animationSpeed: 0});

            // stubbing changeMessage to take out a message and return true
            statusMessenger.changeMessage = function() {
                this.messageQueue.shift()
                return true;
            };
        });

        describe("when no messages are in the que", function() {
            beforeEach(function() {
                spyOn(statusMessenger, 'closeMessage');
                spyOn(statusMessenger, 'openMessage');
                spyOn(statusMessenger, 'changeMessage');

                statusMessenger.nextMessage();
            });

            it("should close the message", function() {
                expect(statusMessenger.closeMessage).not.toHaveBeenCalled();
            });

            it("should open the message", function() {
                expect(statusMessenger.openMessage).not.toHaveBeenCalled();
            });

            it("should change the message", function() {
                expect(statusMessenger.changeMessage).not.toHaveBeenCalled();
            });
        });

        describe("when there is one message in the que", function() {
            it ("should call itself after the timeout", function() {
                runs(function() {
                    spyOn(statusMessenger, 'nextMessage').andCallThrough();

                    statusMessenger.addMessage("albert", "einstein");
                });

                waits(60);

                runs(function() {
                    expect(statusMessenger.nextMessage.callCount).toBe(2);
                });
            });

            describe("when the message is closed", function() {
                beforeEach(function() {
                    spyOn(statusMessenger, "closeMessage");
                    spyOn(statusMessenger, "openMessage");
                    spyOn(statusMessenger, "changeMessage");

                    statusMessenger.addMessage("albert", "einstein");
                });

                it("should not close the message", function() {
                    waits(10);

                    runs(function() {
                        expect(statusMessenger.closeMessage).not.toHaveBeenCalled();
                    });
                });

                it("should open the message", function() {
                    waits(10);

                    runs(function() {
                        expect(statusMessenger.openMessage).toHaveBeenCalled();
                    });
                });

                it("should change the message", function() {
                    waits(10);

                    runs(function() {
                        expect(statusMessenger.changeMessage).toHaveBeenCalled();
                    });
                });
            });

            describe("when the message is opened", function() {
                beforeEach(function() {
                    spyOn(statusMessenger, "closeMessage");

                    statusMessenger.isOpened = true;
                    statusMessenger.addMessage("albert", "einstein");
                });

                it("should close the message", function() {
                    waits(60);

                    runs(function() {
                        expect(statusMessenger.closeMessage).toHaveBeenCalled();
                    });
                });
            });
        });
    });

    describe("changeMessage", function() {
        beforeEach(function() {
            statusMessenger = new WebsiteStatusMessenger();
        });

        describe("when the que is empty", function() {
            it("should not perform a shift on the que", function() {
                spyOn(statusMessenger.messageQueue, "shift");

                statusMessenger.changeMessage();

                expect(statusMessenger.messageQueue.shift).not.toHaveBeenCalled();
            });
        });

        describe("when there are messages in the que", function() {
            beforeEach(function() {
                statusMessenger.messageQueue.push({nr: 0, text: "albert", state: "einstein"})
            });

            it("should perform a shift on the que", function() {
                spyOn(statusMessenger.messageQueue, "shift").andCallThrough();

                statusMessenger.changeMessage();

                expect(statusMessenger.messageQueue.shift).toHaveBeenCalled();
            });

            it("should fill in the new message", function() {
                statusMessenger.changeMessage();

                expect(document.getElementById(statusMessenger.options.id).firstChild.firstChild.innerHTML).toEqual("albert");
            });

            it("should set the message class", function() {
                statusMessenger.changeMessage();

                expect(document.getElementById(statusMessenger.options.id).firstChild.className).toEqual("message einstein");
            });
        });
    });

    describe("openMessage", function() {
        beforeEach(function() {
            statusMessenger = new WebsiteStatusMessenger();
        });

        it("should set isOpened to true", function() {
            statusMessenger.openMessage();
            expect(statusMessenger.isOpened).toBeTruthy();
        });

        it("should call connectorOpenMessage", function() {
            spyOn(statusMessenger, 'connectorOpenMessage');

            statusMessenger.openMessage();

            expect(statusMessenger.connectorOpenMessage).toHaveBeenCalled();
        });
    });

    describe("closeMessage", function() {
        beforeEach(function() {
            statusMessenger = new WebsiteStatusMessenger();
        });

        it("should set isOpened to false", function() {
            // stubbing the open state
            statusMessenger.isOpened = true;

            statusMessenger.closeMessage();
            expect(statusMessenger.isOpened).toBeFalsy();
        });

        it("should call connectorCloseMessage", function() {
            spyOn(statusMessenger, 'connectorCloseMessage');

            statusMessenger.closeMessage();

            expect(statusMessenger.connectorCloseMessage).toHaveBeenCalled();
        });
    });
});